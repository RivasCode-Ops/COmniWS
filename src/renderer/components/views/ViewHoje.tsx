import React, { useMemo } from 'react'
import { OperacionalNode } from '../shell/OperacionalNode'
import type { OperacionalNodeData, LauncherItem } from '../../types/operacional'
import { pt } from '../../i18n'

interface Props {
  apps: LauncherItem[]
  pomodoroAtivo: boolean
  ausentesCount: number
  tarefasCount: number
  selectedId: string | null
  onSelect: (id: string, node: OperacionalNodeData) => void
  onAction: (node: OperacionalNodeData) => void
}

export function ViewHoje({
  apps,
  pomodoroAtivo,
  ausentesCount,
  tarefasCount,
  selectedId,
  onSelect,
  onAction
}: Props) {
  const nodes = useMemo(() => {
    const list: OperacionalNodeData[] = []

    apps.forEach((app) => {
      list.push({
        id: `tool-${app.nome}`,
        categoria: 'ferramenta',
        nome: app.nome,
        subtitulo: app.tipo === 'site' ? pt.abrirNavegador : pt.appLocal,
        acaoLabel: pt.abrir,
        status: 'idle',
        icon: app.tipo === 'site' ? 'external' : 'zap',
        payload: { app }
      })
    })

    list.push({
      id: 'fluxo-foco',
      categoria: 'fluxo',
      nome: pomodoroAtivo ? pt.pausarFocoBloco : pt.iniciarFocoBloco,
      subtitulo: pt.pomodoroSub,
      acaoLabel: pomodoroAtivo ? pt.pausar : pt.iniciar,
      status: pomodoroAtivo ? 'ok' : 'idle',
      icon: 'clock'
    })

    list.push({
      id: 'fluxo-nota',
      categoria: 'fluxo',
      nome: pt.capturarNota,
      subtitulo: pt.notaRapida,
      acaoLabel: pt.capturar,
      status: 'idle',
      icon: 'note'
    })

    list.push({
      id: 'fluxo-inbox',
      categoria: 'fluxo',
      nome: pt.revisarEntradas,
      subtitulo: pt.tarefasPendentes(tarefasCount),
      acaoLabel: pt.navTarefas,
      status: tarefasCount > 0 ? 'warn' : 'ok',
      icon: 'list'
    })

    list.push({
      id: 'ctx-workspace',
      categoria: 'contexto',
      nome: pt.espacoAtivo,
      subtitulo: pt.contextoAtual,
      acaoLabel: pt.trocar,
      status: 'idle',
      icon: 'grid'
    })

    list.push({
      id: 'amb-verificar',
      categoria: 'ambiente',
      nome: pt.verificarMaquina,
      subtitulo: ausentesCount > 0 ? pt.ferramentasAusentes(ausentesCount) : pt.ambienteOk,
      acaoLabel: pt.inventario,
      status: ausentesCount > 0 ? 'warn' : 'ok',
      icon: 'wrench'
    })

    list.push({
      id: 'int-propostas',
      categoria: 'inteligencia',
      nome: pt.propostas,
      subtitulo: pt.propostasSub,
      acaoLabel: pt.abrirCaixa,
      status: 'idle',
      icon: 'spark'
    })

    return list
  }, [apps, pomodoroAtivo, ausentesCount, tarefasCount])

  const secoes = [
    { titulo: pt.secFerramentas, filtro: (n: OperacionalNodeData) => n.categoria === 'ferramenta' },
    { titulo: pt.secFluxo, filtro: (n: OperacionalNodeData) => n.categoria === 'fluxo' },
    { titulo: pt.secContextoAmbiente, filtro: (n: OperacionalNodeData) => n.categoria === 'contexto' || n.categoria === 'ambiente' },
    { titulo: pt.secInteligencia, filtro: (n: OperacionalNodeData) => n.categoria === 'inteligencia' }
  ]

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="mb-6 px-4 py-3 rounded-lg border border-[var(--omni-border-active)] bg-[var(--omni-accent-focus)]/10 text-xs text-[var(--omni-text-muted)]">
        <strong className="text-[var(--omni-text-primary)]">Como usar:</strong> {pt.dicaUso}
      </div>
      {secoes.map((sec) => {
        const items = nodes.filter(sec.filtro)
        if (items.length === 0) return null
        return (
          <section key={sec.titulo} className="mb-8">
            <h2 className="text-[11px] font-semibold uppercase tracking-wider text-[var(--omni-text-dim)] mb-3">
              {sec.titulo}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {items.map((node) => (
                <OperacionalNode
                  key={node.id}
                  node={node}
                  selected={selectedId === node.id}
                  onSelect={() => onSelect(node.id, node)}
                  onAction={() => onAction(node)}
                />
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}
