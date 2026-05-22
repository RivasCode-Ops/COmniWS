import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Login } from './Login'
import { EstacaoShell } from './shell/EstacaoShell'
import { PanelContextual } from './shell/PanelContextual'
import type { CommandItem } from './shell/CommandPalette'
import { ViewHoje } from './views/ViewHoje'
import { ViewFoco } from './views/ViewFoco'
import { ViewTarefas } from './views/ViewTarefas'
import { ViewNotas } from './views/ViewNotas'
import { ViewAmbiente } from './views/ViewAmbiente'
import { ViewFerramentas } from './views/ViewFerramentas'
import { ViewWorkspaces } from './views/ViewWorkspaces'
import { ViewConfig } from './views/ViewConfig'
import { CaixaPropostas } from './CaixaPropostas'
import { StreamPensamento } from './StreamPensamento'
import { VerificadorRequisitos } from './VerificadorRequisitos'
import { useAtalhosTeclado } from './AtalhosTeclado'
import type { OperacionalNodeData, SidebarView, LauncherItem } from '../types/operacional'

interface Sessao {
  sessaoId: number
  usuarioId: number
  usuarioNome: string
  workspaceId: number
  workspaceNome: string
}

interface Estado {
  modo: 'FOCO' | 'FLEX' | 'APRENDIZADO'
  pomodoroAtivo: boolean
  tempoRestante: number
  tarefaAtualId: number | null
  tarefaAtualTitulo: string | null
}

interface Tarefa {
  id: number
  titulo: string
}

export default function EstacaoApp() {
  const [tela, setTela] = useState<'login' | 'estacao'>('login')
  const [sessao, setSessao] = useState<Sessao | null>(null)
  const [sidebarView, setSidebarView] = useState<SidebarView>('hoje')
  const [fullscreen, setFullscreen] = useState(false)
  const [commandOpen, setCommandOpen] = useState(false)
  const [selectedNode, setSelectedNode] = useState<OperacionalNodeData | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const [estado, setEstado] = useState<Estado>({
    modo: 'FLEX',
    pomodoroAtivo: false,
    tempoRestante: 25 * 60,
    tarefaAtualId: null,
    tarefaAtualTitulo: null
  })

  const [tarefas, setTarefas] = useState<Tarefa[]>([])
  const [novaTarefa, setNovaTarefa] = useState('')
  const [mensagemNotificacao, setMensagemNotificacao] = useState('')
  const [apps, setApps] = useState<LauncherItem[]>([])
  const [workspaces, setWorkspaces] = useState<Array<{ id: number; nome: string; ativo: number }>>([])
  const [inventario, setInventario] = useState<{
    ausentes: Array<{ nome: string; id: string }>
    totalAusentes: number
  } | null>(null)
  const [carregandoInventario, setCarregandoInventario] = useState(false)

  const [inputOmniScript, setInputOmniScript] = useState('')
  const [mostrarCaixaPropostas, setMostrarCaixaPropostas] = useState(false)
  const [mostrarStream, setMostrarStream] = useState(false)
  const [mostrarVerificador, setMostrarVerificador] = useState(false)
  const [auxiliarAberta, setAuxiliarAberta] = useState(false)

  const irParaLogin = useCallback(() => {
    setSessao(null)
    setTela('login')
  }, [])

  const carregarTarefas = async () => {
    const lista = await window.electronAPI.tarefasListar()
    setTarefas(lista as Tarefa[])
  }

  const carregarInventario = async () => {
    setCarregandoInventario(true)
    try {
      const data = await window.electronAPI.ambienteInventario()
      setInventario(data)
    } catch {
      setInventario(null)
    }
    setCarregandoInventario(false)
  }

  const carregarApps = async () => {
    const lista = await window.electronAPI.launcherApps()
    setApps(lista as LauncherItem[])
  }

  const carregarWorkspaces = async () => {
    const lista = await window.electronAPI.workspacesListar()
    setWorkspaces(lista as Array<{ id: number; nome: string; ativo: number }>)
  }

  useEffect(() => {
    window.electronAPI.authSessao().then((r) => {
      if (r.sessao) {
        setSessao(r.sessao as Sessao)
        setTela('estacao')
      }
    })
    window.electronAPI.onAuthLogout(() => irParaLogin())
  }, [irParaLogin])

  useEffect(() => {
    if (tela !== 'estacao') return

    window.electronAPI.getEstado().then((e) => setEstado(e as Estado))
    window.electronAPI.onEstadoAtualizado((e) => setEstado(e as Estado))
    window.electronAPI.estacaoGetFullscreen().then((r) => setFullscreen(r.fullscreen))

    window.electronAPI.onPomodoroTerminado(() => {
      setMensagemNotificacao('Pomodoro concluído')
      setTimeout(() => setMensagemNotificacao(''), 4000)
    })
    window.electronAPI.onNovaProposta((p) => {
      setMensagemNotificacao(`Nova proposta: ${p.titulo}`)
      setTimeout(() => setMensagemNotificacao(''), 4000)
    })

    carregarTarefas()
    carregarApps()
    carregarWorkspaces()
    carregarInventario()
  }, [tela])

  useEffect(() => {
    if (estado.modo !== 'FOCO' && tela === 'estacao') carregarInventario()
  }, [estado.modo, tela])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'k') {
        e.preventDefault()
        setCommandOpen(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useAtalhosTeclado({
    onPropostas: () => setMostrarCaixaPropostas((v) => !v),
    onModoFoco: () => {
      window.electronAPI.setModo('FOCO')
      setSidebarView('foco')
    },
    onModoFlex: () => window.electronAPI.setModo('FLEX'),
    onModoAprendizado: () => window.electronAPI.setModo('APRENDIZADO')
  })

  const formatarTempo = (segundos: number) => {
    const m = Math.floor(segundos / 60)
    const s = segundos % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  const abrirApp = (item: LauncherItem) => {
    if (item.tipo === 'app' && item.path) {
      window.electronAPI.abrirApp(item.path.replace('%USERNAME%', ''))
    } else if (item.url) {
      window.electronAPI.abrirSite(item.url)
    }
  }

  const handleNodeAction = async (node: OperacionalNodeData) => {
    switch (node.id) {
      case 'fluxo-foco':
        if (estado.pomodoroAtivo) await window.electronAPI.pomodoroPausar()
        else await window.electronAPI.pomodoroIniciar()
        setSidebarView('foco')
        break
      case 'fluxo-nota':
        setSidebarView('notas')
        break
      case 'fluxo-inbox':
        setSidebarView('tarefas')
        break
      case 'ctx-workspace':
        setSidebarView('workspaces')
        break
      case 'amb-verificar':
      case 'amb-scan':
        setSidebarView('ambiente')
        carregarInventario()
        break
      case 'int-propostas':
        setMostrarCaixaPropostas(true)
        break
      default:
        if (node.categoria === 'ferramenta' && node.payload?.app) {
          abrirApp((node.payload as { app: LauncherItem }).app)
        }
        if (node.id.startsWith('amb-') && node.payload) {
          const p = node.payload as { appId: string; appNome: string }
          await window.electronAPI.ambienteSugerirInstalacao(p.appId, p.appNome)
          setMensagemNotificacao('Proposta criada')
          setMostrarCaixaPropostas(true)
        }
    }
  }

  const estadoLabel = estado.pomodoroAtivo
    ? `Foco ${formatarTempo(estado.tempoRestante)}`
    : estado.modo

  const estadoCor = estado.pomodoroAtivo
    ? 'bg-[var(--omni-accent-focus)]/20 text-[var(--omni-accent-focus)]'
    : estado.modo === 'FOCO'
      ? 'bg-[var(--omni-status-ok)]/20 text-[var(--omni-status-ok)]'
      : 'bg-[var(--omni-bg-hover)] text-[var(--omni-text-muted)]'

  const acaoRapida = () => {
    if (estado.pomodoroAtivo) {
      window.electronAPI.pomodoroPausar()
    } else if (tarefas[0]) {
      window.electronAPI.pomodoroIniciar(tarefas[0].id, tarefas[0].titulo)
      setSidebarView('foco')
    } else {
      window.electronAPI.pomodoroIniciar()
      setSidebarView('foco')
    }
  }

  const commands: CommandItem[] = [
    { id: 'foco', label: 'Iniciar / ir para Foco', group: 'Fluxo', run: () => setSidebarView('foco') },
    { id: 'prop', label: 'Caixa de propostas', group: 'Sistema', run: () => setMostrarCaixaPropostas(true) },
    { id: 'ia', label: 'Acompanhar IA', group: 'Sistema', run: () => setMostrarStream(true) },
    { id: '2t', label: 'Segunda tela', group: 'Sistema', run: () => window.electronAPI.multitelaAbrir() },
    { id: 'flex', label: 'Modo FLEX', group: 'Modo', run: () => window.electronAPI.setModo('FLEX') },
    { id: 'aprend', label: 'Modo APRENDIZADO', group: 'Modo', run: () => window.electronAPI.setModo('APRENDIZADO') },
    { id: 'fs', label: 'Alternar tela cheia', group: 'Janela', run: async () => {
      const next = !fullscreen
      await window.electronAPI.estacaoSetFullscreen(next)
      setFullscreen(next)
    }}
  ]

  if (tela === 'login') {
    return (
      <Login
        onSuccess={() => {
          window.electronAPI.authSessao().then((r) => {
            if (r.sessao) {
              setSessao(r.sessao as Sessao)
              setTela('estacao')
            }
          })
        }}
      />
    )
  }

  if (!sessao) return null

  const centerView = () => {
    switch (sidebarView) {
      case 'foco':
        return (
          <ViewFoco
            tempo={formatarTempo(estado.tempoRestante)}
            tarefaTitulo={estado.tarefaAtualTitulo}
            pomodoroAtivo={estado.pomodoroAtivo}
            onIniciar={() => window.electronAPI.pomodoroIniciar()}
            onPausar={() => window.electronAPI.pomodoroPausar()}
            onReset={() => window.electronAPI.pomodoroResetar()}
          />
        )
      case 'tarefas':
        return (
          <ViewTarefas
            tarefas={tarefas}
            novaTarefa={novaTarefa}
            onNovaChange={setNovaTarefa}
            onAdd={async () => {
              if (!novaTarefa.trim()) return
              await window.electronAPI.tarefasAdicionar(novaTarefa)
              setNovaTarefa('')
              carregarTarefas()
            }}
            onConcluir={async (id) => {
              await window.electronAPI.tarefasConcluir(id)
              carregarTarefas()
            }}
            onRemover={async (id) => {
              await window.electronAPI.tarefasRemover(id)
              carregarTarefas()
            }}
            onPomodoro={(id, titulo) => {
              window.electronAPI.pomodoroIniciar(id, titulo)
              setSidebarView('foco')
            }}
          />
        )
      case 'notas':
        return <ViewNotas modoFoco={estado.modo === 'FOCO'} tarefaAtualId={estado.tarefaAtualId} />
      case 'ambiente':
        return (
          <ViewAmbiente
            ausentes={inventario?.ausentes || []}
            carregando={carregandoInventario}
            modoFoco={estado.modo === 'FOCO'}
            selectedId={selectedId}
            onSelect={(id, node) => {
              setSelectedId(id)
              setSelectedNode(node)
            }}
            onAtualizar={carregarInventario}
            onSugerir={async (appId, appNome) => {
              await window.electronAPI.ambienteSugerirInstalacao(appId, appNome)
              setMostrarCaixaPropostas(true)
            }}
          />
        )
      case 'ferramentas':
        return (
          <ViewFerramentas
            apps={apps}
            selectedId={selectedId}
            onSelect={(id, node) => {
              setSelectedId(id)
              setSelectedNode(node)
            }}
            onAbrir={abrirApp}
          />
        )
      case 'workspaces':
        return (
          <ViewWorkspaces
            workspaces={workspaces}
            onAtivar={async (id) => {
              await window.electronAPI.workspacesAtivar(id)
              carregarWorkspaces()
              carregarApps()
              const r = await window.electronAPI.authSessao()
              if (r.sessao) setSessao(r.sessao as Sessao)
            }}
          />
        )
      case 'config':
        return (
          <ViewConfig
            fullscreen={fullscreen}
            onToggleFullscreen={async () => {
              const next = !fullscreen
              await window.electronAPI.estacaoSetFullscreen(next)
              setFullscreen(next)
            }}
            onVerificador={() => setMostrarVerificador(true)}
            onPropostas={() => setMostrarCaixaPropostas(true)}
            onStream={() => setMostrarStream(true)}
            onSegundaTela={async () => {
              if (auxiliarAberta) await window.electronAPI.multitelaFechar()
              else await window.electronAPI.multitelaAbrir()
            }}
            auxiliarAberta={auxiliarAberta}
          />
        )
      default:
        return (
          <ViewHoje
            apps={apps}
            pomodoroAtivo={estado.pomodoroAtivo}
            ausentesCount={inventario?.totalAusentes || 0}
            tarefasCount={tarefas.length}
            selectedId={selectedId}
            onSelect={(id, node) => {
              setSelectedId(id)
              setSelectedNode(node)
            }}
            onAction={handleNodeAction}
          />
        )
    }
  }

  const omniMini = (
    <div className="space-y-2">
      <input
        value={inputOmniScript}
        onChange={(e) => setInputOmniScript(e.target.value)}
        onKeyDown={async (e) => {
          if (e.key === 'Enter' && inputOmniScript.trim()) {
            const t = inputOmniScript
            setInputOmniScript('')
            if (estado.modo === 'FOCO') await window.electronAPI.iaAnotar(t)
            else await window.electronAPI.iaPerguntar(t)
          }
        }}
        placeholder={estado.modo === 'FOCO' ? 'Anotação (buffer)…' : 'Pergunta à IA…'}
        className="w-full px-2 py-1.5 text-xs rounded bg-[var(--omni-bg-base)] border border-[var(--omni-border)]"
      />
    </div>
  )

  return (
    <>
      <EstacaoShell
        sidebarView={sidebarView}
        onSidebarChange={setSidebarView}
        workspaceNome={sessao.workspaceNome}
        usuarioNome={sessao.usuarioNome}
        estadoLabel={estadoLabel}
        estadoCor={estadoCor}
        acaoRapidaLabel={estado.pomodoroAtivo ? 'Pausar foco' : 'Iniciar foco'}
        onAcaoRapida={acaoRapida}
        onLogout={async () => {
          await window.electronAPI.authLogout()
          irParaLogin()
        }}
        commandOpen={commandOpen}
        onCommandOpen={setCommandOpen}
        commands={commands}
        center={centerView()}
        panel={
          <PanelContextual
            selectedNode={selectedNode}
            estado={estado}
            formatarTempo={formatarTempo}
            tarefasCount={tarefas.length}
            ausentesCount={inventario?.totalAusentes || 0}
            onNodeAction={handleNodeAction}
            onIniciarPomodoro={() => window.electronAPI.pomodoroIniciar()}
            onAbrirApp={abrirApp}
            omniScriptSlot={omniMini}
          />
        }
        toast={mensagemNotificacao || null}
      />

      {mostrarCaixaPropostas && (
        <div className="fixed inset-0 z-[90] flex justify-end bg-black/50" onClick={() => setMostrarCaixaPropostas(false)}>
          <div
            className="w-full max-w-xl h-full bg-[var(--omni-bg-elevated)] overflow-y-auto p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <CaixaPropostas />
          </div>
        </div>
      )}

      {mostrarStream && <StreamPensamento visivel onClose={() => setMostrarStream(false)} />}
      {mostrarVerificador && <VerificadorRequisitos onFechar={() => setMostrarVerificador(false)} />}
    </>
  )
}
