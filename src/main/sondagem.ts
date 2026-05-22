import type Database from 'better-sqlite3'
import schedule from 'node-schedule'
import Parser from 'rss-parser'
import { broadcast } from './broadcast'

const parser = new Parser()

let db: Database.Database
let streamCallback: ((mensagem: string) => void) | null = null
let sondagemJob: schedule.Job | null = null
let startupTimeout: NodeJS.Timeout | null = null
let sondagemEmExecucao = false

const FONTES_CURADAS = [
  { nome: 'Node.js Blog', url: 'https://nodejs.org/en/feed/blog.xml', tipo: 'blog' },
  { nome: 'GitHub Blog', url: 'https://github.blog/feed/', tipo: 'blog' },
  { nome: 'Supabase Changelog', url: 'https://supabase.com/changelog.xml', tipo: 'changelog' },
  { nome: 'Cursor Releases', url: 'https://cursor.com/feed.xml', tipo: 'releases' },
  { nome: 'VS Code Updates', url: 'https://code.visualstudio.com/feed.xml', tipo: 'updates' }
]

export function iniciarSondagem(_db: Database.Database, onStream?: (mensagem: string) => void) {
  db = _db
  streamCallback = onStream || null

  if (sondagemJob) return

  sondagemJob = schedule.scheduleJob('0 */4 * * *', async () => {
    await executarSondagem()
  })

  startupTimeout = setTimeout(() => executarSondagem(), 120000)

  adicionarStream('🤖 IA Autônoma iniciada. Sondagem programada a cada 4 horas.')
}

function adicionarStream(mensagem: string) {
  if (streamCallback) {
    streamCallback(mensagem)
  }
  broadcast('ia-stream', mensagem)
  console.log(`[IA Sondagem] ${mensagem}`)
}

export async function executarSondagem() {
  if (sondagemEmExecucao) return
  sondagemEmExecucao = true

  try {
    adicionarStream('🔍 Iniciando ciclo de sondagem...')

    const propostasCriadas: string[] = []

    for (const fonte of FONTES_CURADAS) {
      try {
        adicionarStream(`📡 Verificando fonte: ${fonte.nome}...`)
        const feed = await parser.parseURL(fonte.url)
        const ultimosItems = feed.items.slice(0, 3)

        for (const item of ultimosItems) {
          const itemHash = `${fonte.nome}-${item.title}`
          const existeProposta = verificarPropostaExistente(itemHash)

          if (!existeProposta && item.title && item.contentSnippet) {
            const titulo = `📰 ${item.title}`
            const descricao = `${item.contentSnippet?.substring(0, 200)}...\n\nFonte: ${fonte.nome}\nLink: ${item.link}`

            criarProposta(titulo, descricao, 'novidade', 'ler', {
              fonte: fonte.nome,
              url: item.link,
              hash: itemHash
            })

            propostasCriadas.push(titulo)
            adicionarStream(`✨ Nova proposta gerada: ${item.title?.substring(0, 50)}...`)
          }
        }
      } catch (error) {
        adicionarStream(`⚠️ Erro ao ler ${fonte.nome}: ${error}`)
      }
    }

    await verificarAtualizacoesFerramentas()

    adicionarStream(`✅ Sondagem concluída. ${propostasCriadas.length} novas propostas criadas.`)
  } finally {
    sondagemEmExecucao = false
  }
}

function verificarPropostaExistente(hash: string): boolean {
  const stmt = db.prepare(`
    SELECT COUNT(*) as total FROM propostas 
    WHERE dados LIKE ? AND created_at > datetime('now', '-7 days')
  `)
  const result = stmt.get(`%${hash}%`) as { total: number }
  return result.total > 0
}

function criarProposta(
  titulo: string,
  descricao: string,
  tipo: string,
  acao: string,
  dados: Record<string, unknown>
) {
  const stmt = db.prepare(`
    INSERT INTO propostas (titulo, descricao, tipo, acao, dados, status) 
    VALUES (?, ?, ?, ?, ?, 'pendente')
  `)
  const result = stmt.run(titulo, descricao, tipo, acao, JSON.stringify(dados))

  broadcast('nova-proposta', {
    id: result.lastInsertRowid,
    titulo,
    descricao
  })

  return result.lastInsertRowid
}

async function verificarAtualizacoesFerramentas() {
  try {
    const { exec } = await import('child_process')
    const { promisify } = await import('util')
    const execPromise = promisify(exec)

    const { stdout } = await execPromise(
      'winget list --accept-source-agreements --upgrade-available --output json',
      { timeout: 30000 }
    )
    const data = JSON.parse(stdout)
    const upgrades =
      data?.Packages?.filter((p: { AvailableVersion?: string }) => p.AvailableVersion) || []

    for (const upgrade of upgrades.slice(0, 5)) {
      const titulo = `🔄 Atualização disponível: ${upgrade.Name}`
      const descricao = `Versão ${upgrade.Version} → ${upgrade.AvailableVersion}\n\nClique para autorizar a atualização via winget.`

      const hash = `upgrade-${upgrade.Id}`
      if (!verificarPropostaExistente(hash)) {
        criarProposta(titulo, descricao, 'atualizacao', 'atualizar', {
          appId: upgrade.Id,
          appNome: upgrade.Name,
          versaoAtual: upgrade.Version,
          versaoNova: upgrade.AvailableVersion,
          hash
        })
        adicionarStream(
          `🔄 Atualização detectada: ${upgrade.Name} ${upgrade.AvailableVersion}`
        )
      }
    }
  } catch (error) {
    adicionarStream(`⚠️ Erro ao verificar atualizações: ${error}`)
  }
}

export function pararSondagem() {
  if (sondagemJob) {
    sondagemJob.cancel()
    sondagemJob = null
  }
  if (startupTimeout) {
    clearTimeout(startupTimeout)
    startupTimeout = null
  }
  adicionarStream('🛑 IA Autônoma desligada pelo usuário.')
}
