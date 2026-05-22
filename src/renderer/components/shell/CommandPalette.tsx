import React, { useEffect, useState } from 'react'
import { pt } from '../../i18n'

export interface CommandItem {
  id: string
  label: string
  group: string
  run: () => void
}

interface Props {
  open: boolean
  onClose: () => void
  commands: CommandItem[]
}

export function CommandPalette({ open, onClose, commands }: Props) {
  const [q, setQ] = useState('')

  useEffect(() => {
    if (!open) setQ('')
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  const filtrados = commands.filter(
    (c) =>
      c.label.toLowerCase().includes(q.toLowerCase()) ||
      c.group.toLowerCase().includes(q.toLowerCase())
  )

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] bg-black/60" onClick={onClose}>
      <div
        className="w-full max-w-lg rounded-xl border border-[var(--omni-border)] bg-[var(--omni-bg-elevated)] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <input
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={pt.cmdBusca}
          className="w-full px-4 py-3 bg-transparent border-b border-[var(--omni-border)] text-sm outline-none"
        />
        <ul className="max-h-64 overflow-y-auto py-1">
          {filtrados.map((cmd) => (
            <li key={cmd.id}>
              <button
                type="button"
                className="w-full text-left px-4 py-2 text-sm hover:bg-[var(--omni-bg-hover)] flex justify-between"
                onClick={() => {
                  cmd.run()
                  onClose()
                }}
              >
                <span>{cmd.label}</span>
                <span className="text-[10px] text-[var(--omni-text-dim)]">{cmd.group}</span>
              </button>
            </li>
          ))}
          {filtrados.length === 0 && (
            <li className="px-4 py-6 text-center text-sm text-[var(--omni-text-muted)]">{pt.cmdNenhum}</li>
          )}
        </ul>
      </div>
    </div>
  )
}
