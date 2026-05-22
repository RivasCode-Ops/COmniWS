import { app, BrowserWindow, ipcMain, shell } from 'electron'
import { join } from 'path'
import { exec } from 'child_process'
import { promisify } from 'util'
import os from 'os'
import Database from 'better-sqlite3'
import axios from 'axios'
import Store from 'electron-store'
import { iniciarSondagem, pararSondagem, executarSondagem } from './sondagem'
import { broadcast, registrarJanela, quantidadeJanelas } from './broadcast'
import { criarTray, destruirTray } from './tray'
import { setupLogger, logger } from './logger'

const execPromise = promisify(exec)

let mainWindow: BrowserWindow | null = null
let auxWindow: BrowserWindow | null = null
let heartbeatInterval: NodeJS.Timeout | null = null
let db: Database.Database

// Buffer de anotações durante FOCO
let bufferAnotacoes: string[] = []
let sondagemAtiva = true

const configStore = new Store<{ autoStart: boolean }>({
  defaults: { autoStart: false }
})

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
    );

    CREATE TABLE IF NOT EXISTS propostas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      titulo TEXT NOT NULL,
      descricao TEXT NOT NULL,
      tipo TEXT NOT NULL,
      acao TEXT NOT NULL,
      dados TEXT,
      status TEXT DEFAULT 'pendente',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS audit_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      acao TEXT NOT NULL,
      tipo_recurso TEXT NOT NULL,
      recurso_id INTEGER,
      detalhes TEXT,
      status TEXT,
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

      broadcast('estado-atualizado', estadoAtual)

      if (estadoAtual.tempoRestante === 0) {
        estadoAtual.pomodoroAtivo = false
        estadoAtual.modo = 'FLEX'
        limparTimer()

        if (bufferAnotacoes.length > 0) {
          const anotacoes = [...bufferAnotacoes]
          bufferAnotacoes = []
          broadcast('processar-buffer', anotacoes)
        }

        broadcast('pomodoro-terminado')
        broadcast('estado-atualizado', estadoAtual)
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

function urlRenderer(view?: 'auxiliar') {
  const base =
    process.env.ELECTRON_RENDERER_URL ||
    (process.env.NODE_ENV === 'development' ? 'http://localhost:5173' : '')
  if (view === 'auxiliar') {
    return base ? `${base}?view=auxiliar` : join(__dirname, '../renderer/index.html')
  }
  return base || join(__dirname, '../renderer/index.html')
}

function sincronizarTodasJanelas() {
  broadcast('multitela-sync-completo', { estado: estadoAtual })
  broadcast('estado-atualizado', estadoAtual)
}

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    frame: true,
    title: 'Omni Work Station',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  registrarJanela(mainWindow)

  const renderer = urlRenderer()
  if (typeof renderer === 'string' && renderer.startsWith('http')) {
    mainWindow.loadURL(renderer)
    if (process.env.NODE_ENV === 'development') {
      mainWindow.webContents.openDevTools()
    }
  } else {
    mainWindow.loadFile(renderer as string)
  }

  mainWindow.on('closed', () => {
    destruirTray()
    if (auxWindow && !auxWindow.isDestroyed()) {
      auxWindow.close()
    }
    mainWindow = null
  })

  mainWindow.once('ready-to-show', () => {
    criarTray(mainWindow!, {
      mostrarJanela: () => {
        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.show()
          mainWindow.focus()
        }
      },
      modoFoco: () => {
        estadoAtual.modo = 'FOCO'
        broadcast('estado-atualizado', estadoAtual)
      },
      modoFlex: () => {
        estadoAtual.modo = 'FLEX'
        broadcast('estado-atualizado', estadoAtual)
      }
    })
    logger.info('Tray do sistema criado')
  })
}

function createAuxWindow() {
  if (auxWindow && !auxWindow.isDestroyed()) {
    auxWindow.focus()
    return { sucesso: true, jaAberta: true }
  }

  auxWindow = new BrowserWindow({
    width: 420,
    height: 640,
    minWidth: 360,
    minHeight: 480,
    title: 'OmniWS — Tela Auxiliar',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  registrarJanela(auxWindow)

  const renderer = urlRenderer('auxiliar')
  if (typeof renderer === 'string' && renderer.startsWith('http')) {
    auxWindow.loadURL(renderer)
  } else {
    auxWindow.loadFile(renderer as string, { query: { view: 'auxiliar' } })
  }

  auxWindow.on('closed', () => {
    auxWindow = null
    broadcast('multitela-status', {
      auxiliarAberta: false,
      janelas: quantidadeJanelas()
    })
  })

  auxWindow.webContents.once('did-finish-load', () => {
    sincronizarTodasJanelas()
    broadcast('multitela-status', {
      auxiliarAberta: true,
      janelas: quantidadeJanelas()
    })
  })

  return { sucesso: true, jaAberta: false }
}

function iniciarHeartbeat() {
  if (heartbeatInterval) return
  heartbeatInterval = setInterval(() => {
    broadcast('multitela-heartbeat', { timestamp: Date.now() })
  }, 2000)
}

ipcMain.handle('get-estado', () => {
  return estadoAtual
})

ipcMain.handle('set-modo', (_, modo: 'FOCO' | 'FLEX' | 'APRENDIZADO') => {
  estadoAtual.modo = modo
  broadcast('estado-atualizado', estadoAtual)
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

  broadcast('estado-atualizado', estadoAtual)

  return { sucesso: true }
})

ipcMain.handle('pomodoro-pausar', () => {
  if (!estadoAtual.pomodoroAtivo) return { sucesso: false }

  estadoAtual.pomodoroAtivo = false
  limparTimer()

  if (mainWindow) {
    broadcast('estado-atualizado', estadoAtual)
  }

  return { sucesso: true }
})

ipcMain.handle('pomodoro-resetar', () => {
  estadoAtual.pomodoroAtivo = false
  estadoAtual.tempoRestante = 25 * 60
  limparTimer()

  broadcast('estado-atualizado', estadoAtual)

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

ipcMain.handle('propostas-listar', () => {
  const stmt = db.prepare("SELECT * FROM propostas WHERE status = 'pendente' ORDER BY created_at ASC")
  return stmt.all()
})

ipcMain.handle(
  'propostas-criar',
  (_, titulo: string, descricao: string, tipo: string, acao: string, dados?: unknown) => {
    const stmt = db.prepare(
      'INSERT INTO propostas (titulo, descricao, tipo, acao, dados, status) VALUES (?, ?, ?, ?, ?, ?)'
    )
    const result = stmt.run(
      titulo,
      descricao,
      tipo,
      acao,
      dados ? JSON.stringify(dados) : null,
      'pendente'
    )

    broadcast('nova-proposta', {
      id: result.lastInsertRowid,
      titulo,
      descricao
    })

    return { id: result.lastInsertRowid }
  }
)

ipcMain.handle('propostas-autorizar', async (_, id: number) => {
  const getStmt = db.prepare('SELECT * FROM propostas WHERE id = ?')
  const proposta = getStmt.get(id) as {
    id: number
    tipo: string
    dados: string | null
  } | undefined

  if (!proposta) return { sucesso: false, motivo: 'Proposta nao encontrada' }

  const updateStmt = db.prepare("UPDATE propostas SET status = 'autorizada' WHERE id = ?")
  updateStmt.run(id)

  const logStmt = db.prepare(
    'INSERT INTO audit_log (acao, tipo_recurso, recurso_id, detalhes, status) VALUES (?, ?, ?, ?, ?)'
  )
  logStmt.run('autorizar', 'proposta', id, JSON.stringify(proposta), 'sucesso')

  let resultado: { sucesso: boolean; comando?: string; mensagem?: string } = { sucesso: true }
  if (proposta.tipo === 'instalacao') {
    const dados = proposta.dados ? JSON.parse(proposta.dados) : {}
    resultado = {
      sucesso: true,
      comando: `winget install --id ${dados.appId} --accept-package-agreements`,
      mensagem: `Execute no terminal para instalar ${dados.appNome}`
    }
  }

  broadcast('proposta-atualizada', { id, status: 'autorizada' })

  return { sucesso: true, ...resultado }
})

ipcMain.handle('propostas-recusar', (_, id: number, paraSempre: boolean = false) => {
  const status = paraSempre ? 'recusado_sempre' : 'recusado'
  const updateStmt = db.prepare('UPDATE propostas SET status = ? WHERE id = ?')
  updateStmt.run(status, id)

  const logStmt = db.prepare(
    'INSERT INTO audit_log (acao, tipo_recurso, recurso_id, detalhes, status) VALUES (?, ?, ?, ?, ?)'
  )
  logStmt.run(
    paraSempre ? 'recusar_sempre' : 'recusar',
    'proposta',
    id,
    JSON.stringify({ paraSempre }),
    'sucesso'
  )

  broadcast('proposta-atualizada', { id, status })

  return { sucesso: true }
})

ipcMain.handle('propostas-agendar', (_, id: number, dataHora: string) => {
  const updateStmt = db.prepare("UPDATE propostas SET status = 'agendado', dados = ? WHERE id = ?")
  updateStmt.run(JSON.stringify({ agendadoPara: dataHora }), id)

  const logStmt = db.prepare(
    'INSERT INTO audit_log (acao, tipo_recurso, recurso_id, detalhes, status) VALUES (?, ?, ?, ?, ?)'
  )
  logStmt.run('agendar', 'proposta', id, JSON.stringify({ agendadoPara: dataHora }), 'sucesso')

  broadcast('proposta-atualizada', { id, status: 'agendado' })

  return { sucesso: true }
})

ipcMain.handle('audit-log-listar', (_, limite: number = 50) => {
  const stmt = db.prepare('SELECT * FROM audit_log ORDER BY created_at DESC LIMIT ?')
  return stmt.all(limite)
})

ipcMain.handle('ambiente-sugerir-instalacao', (_, appId: string, appNome: string) => {
  const titulo = `Instalar ${appNome}`
  const descricao =
    'Ferramenta ausente no contexto "Desenvolvimento". A instalação pode ser feita via winget.'

  const createStmt = db.prepare(
    'INSERT INTO propostas (titulo, descricao, tipo, acao, dados, status) VALUES (?, ?, ?, ?, ?, ?)'
  )
  const result = createStmt.run(
    titulo,
    descricao,
    'instalacao',
    'instalar',
    JSON.stringify({ appId, appNome }),
    'pendente'
  )

  broadcast('nova-proposta', {
    id: result.lastInsertRowid,
    titulo,
    descricao
  })

  return { sucesso: true, propostaId: result.lastInsertRowid }
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

ipcMain.handle('sondagem-status', () => {
  return { ativa: sondagemAtiva }
})

ipcMain.handle('sondagem-toggle', () => {
  sondagemAtiva = !sondagemAtiva
  if (!sondagemAtiva) {
    pararSondagem()
  } else {
    iniciarSondagem(db, (mensagem: string) => broadcast('ia-stream', mensagem))
  }
  return { ativa: sondagemAtiva }
})

ipcMain.handle('sondagem-executar-agora', async () => {
  await executarSondagem()
  return { sucesso: true }
})

ipcMain.handle('multitela-abrir', () => createAuxWindow())

ipcMain.handle('multitela-fechar', () => {
  if (auxWindow && !auxWindow.isDestroyed()) {
    auxWindow.close()
    return { sucesso: true }
  }
  return { sucesso: false, motivo: 'Auxiliar nao aberta' }
})

ipcMain.handle('multitela-status', () => ({
  principalAberta: mainWindow !== null && !mainWindow.isDestroyed(),
  auxiliarAberta: auxWindow !== null && !auxWindow.isDestroyed(),
  janelas: quantidadeJanelas(),
  sincronizada: quantidadeJanelas() > 0
}))

ipcMain.handle('multitela-sync-solicitar', () => ({
  estado: estadoAtual,
  timestamp: Date.now()
}))

ipcMain.handle('multitela-focar-principal', () => {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.focus()
    return { sucesso: true }
  }
  return { sucesso: false }
})

ipcMain.handle('requisitos-verificar', async () => {
  const ramGb = os.totalmem() / 1024 ** 3
  let wingetOk = false
  try {
    await execPromise('winget --version', { timeout: 5000 })
    wingetOk = true
  } catch {
    wingetOk = false
  }
  let ollamaOk = false
  try {
    await axios.get('http://localhost:11434/api/tags', { timeout: 3000 })
    ollamaOk = true
  } catch {
    ollamaOk = false
  }
  return {
    ram: { ok: ramGb >= 4, valor: ramGb },
    nodeJs: { ok: true },
    winget: { ok: wingetOk },
    ollama: { ok: ollamaOk }
  }
})

ipcMain.handle('config-get', () => configStore.store)

ipcMain.handle('config-auto-start', (_, enabled: boolean) => {
  configStore.set('autoStart', enabled)
  app.setLoginItemSettings({
    openAtLogin: enabled,
    name: 'Omni Work Station',
    path: process.execPath
  })
  logger.info(`Auto-start: ${enabled}`)
  return { sucesso: true, autoStart: enabled }
})

app.whenReady().then(() => {
  setupLogger()
  logger.info('Omni Work Station iniciada v1.0.0')

  if (configStore.get('autoStart')) {
    app.setLoginItemSettings({
      openAtLogin: true,
      name: 'Omni Work Station',
      path: process.execPath
    })
  }

  initDatabase()
  createMainWindow()
  iniciarHeartbeat()
  if (sondagemAtiva) {
    iniciarSondagem(db, (mensagem: string) => broadcast('ia-stream', mensagem))
  }
})

app.on('window-all-closed', () => {
  limparTimer()
  if (heartbeatInterval) {
    clearInterval(heartbeatInterval)
    heartbeatInterval = null
  }
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
