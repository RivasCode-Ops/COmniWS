import React from 'react'

interface Tarefa {
  id: number
  titulo: string
}

interface Props {
  tarefas: Tarefa[]
  novaTarefa: string
  onNovaChange: (v: string) => void
  onAdd: () => void
  onConcluir: (id: number) => void
  onRemover: (id: number) => void
  onPomodoro: (id: number, titulo: string) => void
}

export function ViewTarefas({
  tarefas,
  novaTarefa,
  onNovaChange,
  onAdd,
  onConcluir,
  onRemover,
  onPomodoro
}: Props) {
  return (
    <div className="h-full overflow-y-auto p-6 max-w-2xl mx-auto">
      <h2 className="text-lg font-semibold mb-4">Próximas ações</h2>
      <div className="flex gap-2 mb-6">
        <input
          value={novaTarefa}
          onChange={(e) => onNovaChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onAdd()}
          placeholder="Nova tarefa…"
          className="flex-1 px-3 py-2 rounded-lg bg-[var(--omni-bg-elevated)] border border-[var(--omni-border)] text-sm outline-none focus:border-[var(--omni-border-active)]"
        />
        <button
          type="button"
          onClick={onAdd}
          className="px-4 py-2 rounded-lg bg-[var(--omni-accent-focus)] text-sm font-medium"
        >
          Adicionar
        </button>
      </div>
      <ul className="space-y-1">
        {tarefas.length === 0 ? (
          <li className="text-sm text-[var(--omni-text-muted)] py-8 text-center">Inbox vazia</li>
        ) : (
          tarefas.map((t) => (
            <li
              key={t.id}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[var(--omni-bg-hover)] border border-transparent hover:border-[var(--omni-border)]"
            >
              <span className="flex-1 text-sm">{t.titulo}</span>
              <button type="button" onClick={() => onPomodoro(t.id, t.titulo)} className="text-xs text-[var(--omni-cat-fluxo)]">
                Foco
              </button>
              <button type="button" onClick={() => onConcluir(t.id)} className="text-xs text-[var(--omni-status-ok)]">
                OK
              </button>
              <button type="button" onClick={() => onRemover(t.id)} className="text-xs text-[var(--omni-status-error)]">
                ×
              </button>
            </li>
          ))
        )}
      </ul>
    </div>
  )
}
