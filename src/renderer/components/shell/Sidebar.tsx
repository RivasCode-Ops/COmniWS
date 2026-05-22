import React from 'react'
import type { SidebarView } from '../../types/operacional'

const ITENS: { id: SidebarView; label: string }[] = [
  { id: 'hoje', label: 'Hoje' },
  { id: 'workspaces', label: 'Workspaces' },
  { id: 'foco', label: 'Foco' },
  { id: 'tarefas', label: 'Tarefas' },
  { id: 'notas', label: 'Notas' },
  { id: 'ferramentas', label: 'Ferramentas' },
  { id: 'ambiente', label: 'Ambiente' },
  { id: 'config', label: 'Configurações' }
]

interface Props {
  view: SidebarView
  onChange: (v: SidebarView) => void
}

export function Sidebar({ view, onChange }: Props) {
  return (
    <nav
      className="shrink-0 flex flex-col py-3 border-r border-[var(--omni-border)] bg-[var(--omni-bg-elevated)]"
      style={{ width: 'var(--omni-sidebar-w)' }}
    >
      <div className="px-4 mb-4">
        <div className="text-xs font-bold tracking-widest text-[var(--omni-text-dim)]">OMNI</div>
        <div className="text-[10px] text-[var(--omni-text-muted)]">Work Station</div>
      </div>
      {ITENS.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => onChange(item.id)}
          className={`
            relative text-left px-4 py-2.5 text-sm transition-colors
            ${view === item.id ? 'text-[var(--omni-text-primary)] bg-[var(--omni-bg-hover)]' : 'text-[var(--omni-text-muted)] hover:text-[var(--omni-text-primary)]'}
          `}
        >
          {view === item.id && (
            <span className="absolute left-0 top-1 bottom-1 w-0.5 bg-[var(--omni-accent-focus)] rounded-r" />
          )}
          {item.label}
        </button>
      ))}
    </nav>
  )
}
