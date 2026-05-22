import { app, BrowserWindow, ipcMain, shell } from 'electron'
import { join } from 'path'
import { exec } from 'child_process'
import { promisify } from 'util'
import Database from 'better-sqlite3'
import axios from 'axios'

const execPromise = promisify(exec)

let mainWindow: BrowserWindow | null = null
let db: Database.Database

// Buffer de anotações durante FOCO
let bufferAnotacoes: string[] = []

// Inicializar banco de dados
function initDatabase() {
  const userDataPath = app.getPath('userData')
  db = new Database(join(userDataPath, 'omniws.db'))

  db.exec(`
    CREATE TABLE IF NOT EXISTS tarefas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      titulo TEXT NOT NULL,
      status TEXT DEFAULT 'inbox',
      prioridade TEXT DEFAULT 'media',
      concluida INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS conversas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      pergunta TEXT NOT NULL,
      resposta TEXT NOT NULL,
      modo TEXT DEFAULT 'FLEX',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS anotacoes_buffer (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      conteudo TEXT NOT NULL,
      modo TEXT DEFAULT 'FOCO',
      processada INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  const count = db.prepare('SELECT COUNT(*) as total FROM tarefas').get() as { total: number }
  if (count.total === 0) {
    const insert = db.prepare('INSERT INTO tarefas (titulo, status) VALUES (?, ?)')
    insert.run('Configurar Omni Work Station', 'inbox')
    insert.run('Testar Pomodoro integrado', 'inbox')
    insert.run('Revisar propostas da IA', 'inbox')
  }
}

let estadoAtual = {
  modo: 'FLEX' as 'FOCO' | 'FLEX' | 'APRENDIZADO',
  pomodoroAtivo: false,
  tempoRestante: 25 * 60,
  tarefaAtualId: null as number | null,
  tarefaAtualTitulo: null as string | null
}

let timerInterval: NodeJS.Timeout | null = null

function limparTimer() {
  if (timerInterval) {
    clearInterval(timerInterval)
    timerInterval = null
  }
}

function iniciarTimer() {
  if (timerInterval) limparTimer()

  timerInterval = setInterval(() => {
    if (estadoAtual.pomodoroAtivo && estadoAtual.tempoRestante > 0) {
      estadoAtual.tempoRestante--

      if (mainWindow) {
        mainWindow.webContents.send('estado-atualizado', estadoAtual)
      }

      if (estadoAtual.tempoRestante === 0) {
        estadoAtual.pomodoroAtivo = false
        estadoAtual.modo = 'FLEX'
        limparTimer()

        if (bufferAnotacoes.length > 0) {
          const anotacoes = [...bufferAnotacoes]
          bufferAnotacoes = []
          if (mainWindow) {
            mainWindow.webContents.send('processar-buffer', anotacoes)
          }
        }

        if (mainWindow) {
          mainWindow.webContents.send('pomodoro-terminado')
          mainWindow.webContents.send('estado-atualizado', estadoAtual)
        }
      }
    }
  }, 1000)
}

async function chamarIA(pergunta: string): Promise<string> {
  try {
    const response = await axios.post(
      'http://localhost:11434/api/generate',
      {
        model: 'llama3.2:3b',
        prompt: pergunta,
        stream: false
      },
      { timeout: 30000 }
    )

    return response.data.response || 'Desculpe, não consegui processar sua pergunta.'
  } catch (error) {
    console.error('Erro Ollama:', error)
    return '⚠️ IA offline. Verifique se o Ollama está rodando com `ollama run llama3.2:3b`'
  }
}

async function obterInventarioWinget() {
  try {
    const { stdout } = await execPromise(
      'winget list --accept-source-agreements --output json',
      { timeout: 30000 }
    )
    const data = JSON.parse(stdout)
    const apps = data?.Packages || data?.Items || data || []

    return apps.map((app: { Name?: string; Nome?: string; Id?: string; IdPacote?: string; Version?: string; Versao?: string }) => ({
      nome: app.Name || app.Nome || 'Desconhecido',
      id: app.Id || app.IdPacote || '',
      versao: app.Version || app.Versao || '0.0.0',
      instalado: true
    }))
  } catch (error) {
    console.error('Erro winget:', error)
    return []
  }
}

const FERRAMENTAS_DESEJADAS = [
  { nome: 'Git', id: 'Git.Git' },
  { nome: 'Node.js', id: 'OpenJS.NodeJS' },
  { nome: 'Cursor', id: 'Cursor.Cursor' },
  { nome: 'VS Code', id: 'Microsoft.VisualStudioCode' },
  { nome: 'Docker Desktop', id: 'Docker.DockerDesktop' },
  { nome: 'Supabase CLI', id: 'Supabase.Supabase' }
]

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    frame: true,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173')
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

ipcMain.handle('get-estado', () => {
  return estadoAtual
})

ipcMain.handle('set-modo', (_, modo: 'FOCO' | 'FLEX' | 'APRENDIZADO') => {
  estadoAtual.modo = modo
  if (mainWindow) {
    mainWindow.webContents.send('estado-atualizado', estadoAtual)
  }
  return estadoAtual
})

ipcMain.handle('pomodoro-iniciar', async (_, tarefaId?: number, tarefaTitulo?: string) => {
  if (estadoAtual.pomodoroAtivo) return { sucesso: false, motivo: 'Ja ativo' }

  estadoAtual.pomodoroAtivo = true
  estadoAtual.modo = 'FOCO'
  estadoAtual.tempoRestante = 25 * 60
  estadoAtual.tarefaAtualId = tarefaId || null
  estadoAtual.tarefaAtualTitulo = tarefaTitulo || null

  iniciarTimer()

  if (mainWindow) {
    mainWindow.webContents.send('estado-atualizado', estadoAtual)
  }

  return { sucesso: true }
})

ipcMain.handle('pomodoro-pausar', () => {
  if (!estadoAtual.pomodoroAtivo) return { sucesso: false }

  estadoAtual.pomodoroAtivo = false
  limparTimer()

  if (mainWindow) {
    mainWindow.webContents.send('estado-atualizado', estadoAtual)
  }

  return { sucesso: true }
})

ipcMain.handle('pomodoro-resetar', () => {
  estadoAtual.pomodoroAtivo = false
  estadoAtual.tempoRestante = 25 * 60
  limparTimer()

  if (mainWindow) {
    mainWindow.webContents.send('estado-atualizado', estadoAtual)
  }

  return { sucesso: true }
})

ipcMain.handle('ia-perguntar', async (_, pergunta: string) => {
  const resposta = await chamarIA(pergunta)

  const stmt = db.prepare('INSERT INTO conversas (pergunta, resposta, modo) VALUES (?, ?, ?)')
  stmt.run(pergunta, resposta, estadoAtual.modo)

  return { pergunta, resposta }
})

ipcMain.handle('ia-anotar', (_, anotacao: string) => {
  if (estadoAtual.modo === 'FOCO') {
    bufferAnotacoes.push(anotacao)
    const stmt = db.prepare('INSERT INTO anotacoes_buffer (conteudo, modo) VALUES (?, ?)')
    stmt.run(anotacao, 'FOCO')
    return { sucesso: true, bufferizado: true, tamanhoBuffer: bufferAnotacoes.length }
  }

  return { sucesso: true, bufferizado: false, precisaIA: true, anotacao }
})

ipcMain.handle('ia-processar-buffer', async () => {
  const anotacoes = [...bufferAnotacoes]
  bufferAnotacoes = []

  if (anotacoes.length === 0) return { sucesso: true, respostas: [] }

  const respostas: Array<{ pergunta: string; resposta: string }> = []
  for (const anotacao of anotacoes) {
    const resposta = await chamarIA(anotacao)
    respostas.push({ pergunta: anotacao, resposta })

    const stmt = db.prepare('INSERT INTO conversas (pergunta, resposta, modo) VALUES (?, ?, ?)')
    stmt.run(anotacao, resposta, 'FOCO_POST')
  }

  return { sucesso: true, respostas }
})

ipcMain.handle('ia-historico', () => {
  const stmt = db.prepare('SELECT * FROM conversas ORDER BY created_at DESC LIMIT 50')
  return stmt.all()
})

ipcMain.handle('tarefas-listar', () => {
  const stmt = db.prepare('SELECT * FROM tarefas WHERE concluida = 0 ORDER BY created_at DESC')
  return stmt.all()
})

ipcMain.handle('tarefas-adicionar', (_, titulo: string) => {
  const stmt = db.prepare('INSERT INTO tarefas (titulo, status) VALUES (?, ?)')
  const result = stmt.run(titulo, 'inbox')
  return { id: result.lastInsertRowid, titulo }
})

ipcMain.handle('tarefas-concluir', (_, id: number) => {
  const stmt = db.prepare('UPDATE tarefas SET concluida = 1 WHERE id = ?')
  stmt.run(id)
  return { sucesso: true }
})

ipcMain.handle('tarefas-remover', (_, id: number) => {
  const stmt = db.prepare('DELETE FROM tarefas WHERE id = ?')
  stmt.run(id)
  return { sucesso: true }
})

ipcMain.handle('ambiente-inventario', async () => {
  const instalados = await obterInventarioWinget()
  const ausentes = FERRAMENTAS_DESEJADAS.filter(
    (ferramenta) =>
      !instalados.some(
        (inst: { nome: string; id: string }) =>
          inst.nome.toLowerCase().includes(ferramenta.nome.toLowerCase()) ||
          inst.id.toLowerCase() === ferramenta.id.toLowerCase()
      )
  )

  return {
    instalados: instalados.slice(0, 30),
    ausentes,
    totalInstalados: instalados.length,
    totalAusentes: ausentes.length,
    timestamp: new Date().toISOString()
  }
})

ipcMain.handle('ambiente-instalar', async (_, appId: string, appNome: string) => {
  return {
    sucesso: false,
    precisaAutorizacao: true,
    comando: `winget install --id ${appId} --accept-package-agreements`,
    mensagem: `Para instalar ${appNome}, execute no terminal (ou autorize na Caixa de Propostas Fase 5)`
  }
})

ipcMain.handle('abrir-app', async (_, appPath: string) => {
  try {
    exec(`start "" "${appPath}"`)
    return { sucesso: true }
  } catch (error) {
    return { sucesso: false, erro: String(error) }
  }
})

ipcMain.handle('abrir-site', async (_, url: string) => {
  try {
    await shell.openExternal(url)
    return { sucesso: true }
  } catch (error) {
    return { sucesso: false, erro: String(error) }
  }
})

app.whenReady().then(() => {
  initDatabase()
  createWindow()
})

app.on('window-all-closed', () => {
  limparTimer()
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
