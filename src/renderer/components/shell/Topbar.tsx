import React, { useState, useEffect } from 'react'
import { pt } from '../../i18n'

interface Props {
  workspaceNome: string
  usuarioNome: string
  estadoLabel: string
  estadoCor: string
  acaoRapidaLabel: string
  onAcaoRapida: () => void
  onBuscaFocus: () => void
  onLogout: () => void
}

export function Topbar({
  workspaceNome,
  usuarioNome,
  estadoLabel,
  estadoCor,
  acaoRapidaLabel,
  onAcaoRapida,
  onBuscaFocus,
  onLogout
}: Props) {
  const [hora, setHora] = useState(new Date())

  useEffect(() => {
    const t = setInterval(() => setHora(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  return (
    <header
      className="shrink-0 flex items-center gap-4 px-4 border-b border-[var(--omni-border)] bg-[var(--omni-bg-elevated)]"
      style={{ height: 'var(--omni-topbar-h)' }}
    >
      <button
        type="button"
        onClick={onBuscaFocus}
        className="flex-1 max-w-md text-left text-sm px-3 py-1.5 rounded-md border border-[var(--omni-border)] bg-[var(--omni-bg-base)] text-[var(--omni-text-muted)] hover:border-[var(--omni-border-active)]"
      >
        {pt.buscaPlaceholder} <span className="float-right text-[10px] opacity-60">Ctrl+K</span>
      </button>

      <span className="omni-mono text-xs text-[var(--omni-text-muted)] tabular-nums">
        {hora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
      </span>

      <span className={`text-xs px-2 py-1 rounded-md font-medium ${estadoCor}`}>{estadoLabel}</span>

      <button
        type="button"
        onClick={onAcaoRapida}
        className="text-xs font-semibold px-3 py-1.5 rounded-md bg-[var(--omni-accent-focus)] text-white hover:opacity-90"
      >
        {acaoRapidaLabel}
      </button>

      <div className="flex items-center gap-2 pl-2 border-l border-[var(--omni-border)]">
        <div className="text-right">
          <div className="text-xs font-medium">{usuarioNome}</div>
          <div className="text-[10px] text-[var(--omni-text-muted)]">{workspaceNome}</div>
        </div>
        <button
          type="button"
          onClick={onLogout}
          className="w-8 h-8 rounded-full bg-[var(--omni-bg-hover)] text-xs font-bold text-[var(--omni-text-muted)] hover:text-[var(--omni-text-primary)]"
          title={pt.sair}
        >
          {usuarioNome.charAt(0).toUpperCase()}
        </button>
      </div>
    </header>
  )
}
