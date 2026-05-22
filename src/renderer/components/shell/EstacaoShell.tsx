import React from 'react'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import { CommandPalette, type CommandItem } from './CommandPalette'
import type { SidebarView } from '../../types/operacional'

interface Props {
  sidebarView: SidebarView
  onSidebarChange: (v: SidebarView) => void
  workspaceNome: string
  usuarioNome: string
  estadoLabel: string
  estadoCor: string
  acaoRapidaLabel: string
  onAcaoRapida: () => void
  onLogout: () => void
  commandOpen: boolean
  onCommandOpen: (open: boolean) => void
  commands: CommandItem[]
  center: React.ReactNode
  panel: React.ReactNode
  toast?: string | null
}

export function EstacaoShell({
  sidebarView,
  onSidebarChange,
  workspaceNome,
  usuarioNome,
  estadoLabel,
  estadoCor,
  acaoRapidaLabel,
  onAcaoRapida,
  onLogout,
  commandOpen,
  onCommandOpen,
  commands,
  center,
  panel,
  toast
}: Props) {
  return (
    <div className="omni-shell h-screen flex flex-col overflow-hidden">
      <Topbar
        workspaceNome={workspaceNome}
        usuarioNome={usuarioNome}
        estadoLabel={estadoLabel}
        estadoCor={estadoCor}
        acaoRapidaLabel={acaoRapidaLabel}
        onAcaoRapida={onAcaoRapida}
        onBuscaFocus={() => onCommandOpen(true)}
        onLogout={onLogout}
      />

      <div className="flex flex-1 min-h-0">
        <Sidebar view={sidebarView} onChange={onSidebarChange} />

        <main className="flex-1 min-w-0 omni-canvas-grid overflow-hidden relative">{center}</main>

        <aside
          className="shrink-0 border-l border-[var(--omni-border)] bg-[var(--omni-bg-elevated)] overflow-y-auto"
          style={{ width: 'var(--omni-panel-w)' }}
        >
          {panel}
        </aside>
      </div>

      {toast && (
        <div
          className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-lg text-sm font-medium shadow-lg max-w-md text-center ${
            toast.startsWith('Erro')
              ? 'bg-[var(--omni-status-error)] text-white'
              : 'bg-[var(--omni-status-ok)] text-[#0d0f12]'
          }`}
        >
          {toast}
        </div>
      )}

      <CommandPalette open={commandOpen} onClose={() => onCommandOpen(false)} commands={commands} />
    </div>
  )
}
