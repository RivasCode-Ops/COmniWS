import React from 'react'
import { pt } from '../../i18n'

interface Props {
  tempo: string
  tarefaTitulo: string | null
  pomodoroAtivo: boolean
  onIniciar: () => void
  onPausar: () => void
  onReset: () => void
}

export function ViewFoco({ tempo, tarefaTitulo, pomodoroAtivo, onIniciar, onPausar, onReset }: Props) {
  return (
    <div className="h-full flex flex-col items-center justify-center p-8">
      <p className="text-[11px] uppercase tracking-widest text-[var(--omni-cat-fluxo)] mb-2">{pt.sessaoFoco}</p>
      <div className="omni-mono text-7xl font-bold tabular-nums text-[var(--omni-text-primary)] mb-4">{tempo}</div>
      {tarefaTitulo && (
        <p className="text-sm text-[var(--omni-text-muted)] mb-8 max-w-md text-center">{tarefaTitulo}</p>
      )}
      <div className="flex gap-3">
        {!pomodoroAtivo ? (
          <button
            type="button"
            onClick={onIniciar}
            className="px-6 py-2 rounded-lg bg-[var(--omni-accent-focus)] text-sm font-semibold"
          >
            {pt.iniciarPomodoro}
          </button>
        ) : (
          <button
            type="button"
            onClick={onPausar}
            className="px-6 py-2 rounded-lg bg-[var(--omni-status-warn)] text-[#0d0f12] text-sm font-semibold"
          >
            {pt.pausar}
          </button>
        )}
        <button
          type="button"
          onClick={onReset}
          className="px-6 py-2 rounded-lg border border-[var(--omni-border)] text-sm"
        >
          {pt.resetar}
        </button>
      </div>
      <p className="mt-10 text-xs text-[var(--omni-text-dim)] max-w-sm text-center">{pt.focoR3}</p>
    </div>
  )
}
