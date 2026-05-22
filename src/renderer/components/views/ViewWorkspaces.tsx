import React from 'react'
import { pt } from '../../i18n'

interface Workspace {
  id: number
  nome: string
  ativo: number
}

interface Props {
  workspaces: Workspace[]
  onAtivar: (id: number) => void
}

export function ViewWorkspaces({ workspaces, onAtivar }: Props) {
  return (
    <div className="h-full overflow-y-auto p-6 max-w-lg mx-auto">
      <h2 className="text-lg font-semibold mb-4">{pt.espacosTitulo}</h2>
      <ul className="space-y-2">
        {workspaces.map((ws) => (
          <li key={ws.id}>
            <button
              type="button"
              onClick={() => onAtivar(ws.id)}
              className={`w-full text-left px-4 py-3 rounded-lg border ${
                ws.ativo
                  ? 'border-[var(--omni-accent-focus)] bg-[var(--omni-bg-hover)]'
                  : 'border-[var(--omni-border)] bg-[var(--omni-bg-elevated)]'
              }`}
            >
              <span className="font-medium text-sm">{ws.nome}</span>
              {ws.ativo ? (
                <span className="ml-2 text-[10px] text-[var(--omni-accent-focus)]">{pt.espacoAtivoBadge}</span>
              ) : null}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
