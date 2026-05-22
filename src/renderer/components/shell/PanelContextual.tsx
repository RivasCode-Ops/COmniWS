import React from 'react'
import type { OperacionalNodeData } from '../../types/operacional'
import type { LauncherItem } from '../../types/operacional'

interface Estado {
  modo: string
  pomodoroAtivo: boolean
  tempoRestante: number
  tarefaAtualTitulo: string | null
}

interface Props {
  selectedNode: OperacionalNodeData | null
  estado: Estado
  formatarTempo: (s: number) => string
  tarefasCount: number
  ausentesCount: number
  onNodeAction: (node: OperacionalNodeData) => void
  onIniciarPomodoro: () => void
  onAbrirApp: (app: LauncherItem) => void
  omniScriptSlot?: React.ReactNode
  propostasSlot?: React.ReactNode
}

export function PanelContextual({
  selectedNode,
  estado,
  formatarTempo,
  tarefasCount,
  ausentesCount,
  onNodeAction,
  onIniciarPomodoro,
  onAbrirApp,
  omniScriptSlot,
  propostasSlot
}: Props) {
  return (
    <div className="p-4 h-full flex flex-col text-sm">
      <h3 className="text-[11px] font-semibold uppercase tracking-wider text-[var(--omni-text-dim)] mb-4">
        Contexto
      </h3>

      {!selectedNode ? (
        <div className="space-y-4 flex-1">
          <div className="p-3 rounded-lg bg-[var(--omni-bg-base)] border border-[var(--omni-border)]">
            <div className="text-[10px] text-[var(--omni-text-dim)] mb-1">Estação</div>
            <div className="font-medium">{estado.modo}</div>
            <div className="omni-mono text-2xl mt-2 tabular-nums">{formatarTempo(estado.tempoRestante)}</div>
            {estado.tarefaAtualTitulo && (
              <div className="text-xs text-[var(--omni-text-muted)] mt-1">{estado.tarefaAtualTitulo}</div>
            )}
          </div>
          <div className="text-xs text-[var(--omni-text-muted)] space-y-1">
            <p>{tarefasCount} tarefa(s) na inbox</p>
            <p>{ausentesCount} ferramenta(s) ausente(s)</p>
          </div>
          {!estado.pomodoroAtivo && (
            <button
              type="button"
              onClick={onIniciarPomodoro}
              className="w-full py-2 rounded-lg bg-[var(--omni-accent-focus)] text-xs font-semibold"
            >
              Iniciar foco agora
            </button>
          )}
          <p className="text-[10px] text-[var(--omni-text-dim)]">
            Selecione um bloco no canvas para ver detalhes e ações.
          </p>
        </div>
      ) : (
        <div className="flex-1 space-y-4">
          <div>
            <div className="text-[10px] uppercase text-[var(--omni-text-dim)]">{selectedNode.categoria}</div>
            <div className="text-lg font-semibold mt-1">{selectedNode.nome}</div>
            <p className="text-xs text-[var(--omni-text-muted)] mt-2">{selectedNode.subtitulo}</p>
          </div>
          <button
            type="button"
            onClick={() => onNodeAction(selectedNode)}
            className="w-full py-2.5 rounded-lg bg-[var(--omni-accent-focus)] font-medium text-xs"
          >
            {selectedNode.acaoLabel}
          </button>
          {selectedNode.categoria === 'ferramenta' && selectedNode.payload?.app && (
            <button
              type="button"
              onClick={() => onAbrirApp((selectedNode.payload as { app: LauncherItem }).app)}
              className="w-full py-2 rounded-lg border border-[var(--omni-border)] text-xs"
            >
              Abrir agora
            </button>
          )}
        </div>
      )}

      {omniScriptSlot && (
        <div className="mt-4 pt-4 border-t border-[var(--omni-border)]">{omniScriptSlot}</div>
      )}

      {propostasSlot && (
        <div className="mt-4 pt-4 border-t border-[var(--omni-border)] max-h-48 overflow-y-auto">
          {propostasSlot}
        </div>
      )}
    </div>
  )
}
