import React from 'react'
import { OperacionalNode } from '../shell/OperacionalNode'
import type { OperacionalNodeData } from '../../types/operacional'
import { pt } from '../../i18n'

interface Props {
  ausentes: Array<{ nome: string; id: string }>
  carregando: boolean
  modoFoco: boolean
  selectedId: string | null
  onSelect: (id: string, node: OperacionalNodeData) => void
  onAtualizar: () => void
  onSugerir: (id: string, nome: string) => void
}

export function ViewAmbiente({
  ausentes,
  carregando,
  modoFoco,
  selectedId,
  onSelect,
  onAtualizar,
  onSugerir
}: Props) {
  const nodes: OperacionalNodeData[] = [
    {
      id: 'amb-scan',
      categoria: 'ambiente',
      nome: pt.atualizarInventario,
      subtitulo: modoFoco ? pt.pausadoFoco : 'Lista de programas (winget)',
      acaoLabel: pt.inventario,
      status: modoFoco ? 'idle' : carregando ? 'warn' : 'ok',
      icon: 'wrench'
    },
    ...ausentes.map((a) => ({
      id: `amb-${a.id}`,
      categoria: 'ambiente' as const,
      nome: a.nome,
      subtitulo: pt.ferramentaAusente,
      acaoLabel: pt.sugerirInstalacao,
      status: 'warn' as const,
      icon: 'wrench',
      payload: { appId: a.id, appNome: a.nome }
    }))
  ]

  return (
    <div className="h-full overflow-y-auto p-6">
      <h2 className="text-lg font-semibold mb-4">{pt.ambienteWindows}</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {nodes.map((node) => (
          <OperacionalNode
            key={node.id}
            node={node}
            selected={selectedId === node.id}
            onSelect={() => onSelect(node.id, node)}
            onAction={() => {
              if (node.id === 'amb-scan') onAtualizar()
              else {
                const p = node.payload as { appId: string; appNome: string }
                onSugerir(p.appId, p.appNome)
              }
            }}
          />
        ))}
      </div>
    </div>
  )
}
