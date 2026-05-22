import React from 'react'
import type { SidebarView } from '../../types/operacional'
import { pt } from '../../i18n'

const ITENS: { id: SidebarView; label: string }[] = [
  { id: 'hoje', label: pt.navHoje },
  { id: 'workspaces', label: pt.navEspacos },
  { id: 'foco', label: pt.navFoco },
  { id: 'tarefas', label: pt.navTarefas },
  { id: 'notas', label: pt.navNotas },
  { id: 'ferramentas', label: pt.navFerramentas },
  { id: 'ambiente', label: pt.navAmbiente },
  { id: 'config', label: pt.navConfig }
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
        <div className="text-[10px] text-[var(--omni-text-muted)]">{pt.appSubtitulo}</div>
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
