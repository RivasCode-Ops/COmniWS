import React from 'react'
import { OperacionalNode } from '../shell/OperacionalNode'
import type { OperacionalNodeData, LauncherItem } from '../../types/operacional'

interface Props {
  apps: LauncherItem[]
  selectedId: string | null
  onSelect: (id: string, node: OperacionalNodeData) => void
  onAbrir: (app: LauncherItem) => void
}

export function ViewFerramentas({ apps, selectedId, onSelect, onAbrir }: Props) {
  const nodes: OperacionalNodeData[] = apps.map((app) => ({
    id: `tool-${app.nome}`,
    categoria: 'ferramenta',
    nome: app.nome,
    subtitulo: app.tipo === 'site' ? 'Site' : 'App',
    acaoLabel: 'Abrir',
    status: 'idle',
    icon: app.tipo === 'site' ? 'external' : 'zap',
    payload: { app }
  }))

  return (
    <div className="h-full overflow-y-auto p-6">
      <h2 className="text-lg font-semibold mb-4">Ferramentas</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {nodes.map((node) => (
          <OperacionalNode
            key={node.id}
            node={node}
            selected={selectedId === node.id}
            onSelect={() => onSelect(node.id, node)}
            onAction={() => onAbrir((node.payload as { app: LauncherItem }).app)}
          />
        ))}
      </div>
    </div>
  )
}
