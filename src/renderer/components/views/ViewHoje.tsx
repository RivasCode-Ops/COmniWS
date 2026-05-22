import React, { useMemo } from 'react'
import { OperacionalNode } from '../shell/OperacionalNode'
import type { OperacionalNodeData, LauncherItem } from '../../types/operacional'

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
        subtitulo: app.tipo === 'site' ? 'Abrir no navegador' : 'Aplicativo local',
        acaoLabel: 'Abrir',
        status: 'idle',
        icon: app.tipo === 'site' ? 'external' : 'zap',
        payload: { app }
      })
    })

    list.push({
      id: 'fluxo-foco',
      categoria: 'fluxo',
      nome: pomodoroAtivo ? 'Pausar foco' : 'Iniciar foco',
      subtitulo: 'Pomodoro 25 min · modo FOCO',
      acaoLabel: pomodoroAtivo ? 'Pausar' : 'Iniciar',
      status: pomodoroAtivo ? 'ok' : 'idle',
      icon: 'clock'
    })

    list.push({
      id: 'fluxo-nota',
      categoria: 'fluxo',
      nome: 'Capturar nota',
      subtitulo: 'Nota inteligente rápida',
      acaoLabel: 'Capturar',
      status: 'idle',
      icon: 'note'
    })

    list.push({
      id: 'fluxo-inbox',
      categoria: 'fluxo',
      nome: 'Revisar inbox',
      subtitulo: `${tarefasCount} tarefa(s) pendente(s)`,
      acaoLabel: 'Ver tarefas',
      status: tarefasCount > 0 ? 'warn' : 'ok',
      icon: 'list'
    })

    list.push({
      id: 'ctx-workspace',
      categoria: 'contexto',
      nome: 'Workspace ativo',
      subtitulo: 'Contexto operacional atual',
      acaoLabel: 'Trocar',
      status: 'idle',
      icon: 'grid'
    })

    list.push({
      id: 'amb-verificar',
      categoria: 'ambiente',
      nome: 'Verificar máquina',
      subtitulo: ausentesCount > 0 ? `${ausentesCount} ferramenta(s) ausente(s)` : 'Ambiente OK',
      acaoLabel: 'Inventário',
      status: ausentesCount > 0 ? 'warn' : 'ok',
      icon: 'wrench'
    })

    list.push({
      id: 'int-propostas',
      categoria: 'inteligencia',
      nome: 'Propostas',
      subtitulo: 'Autorizar ou recusar ações',
      acaoLabel: 'Abrir caixa',
      status: 'idle',
      icon: 'spark'
    })

    return list
  }, [apps, pomodoroAtivo, ausentesCount, tarefasCount])

  const secoes = [
    { titulo: 'Ferramentas', filtro: (n: OperacionalNodeData) => n.categoria === 'ferramenta' },
    { titulo: 'Fluxo', filtro: (n: OperacionalNodeData) => n.categoria === 'fluxo' },
    { titulo: 'Contexto & ambiente', filtro: (n: OperacionalNodeData) => n.categoria === 'contexto' || n.categoria === 'ambiente' },
    { titulo: 'Inteligência', filtro: (n: OperacionalNodeData) => n.categoria === 'inteligencia' }
  ]

  return (
    <div className="h-full overflow-y-auto p-6">
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
