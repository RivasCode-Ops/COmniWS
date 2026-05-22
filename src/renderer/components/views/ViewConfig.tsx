import React from 'react'
import { pt } from '../../i18n'

interface Props {
  fullscreen: boolean
  onToggleFullscreen: () => void
  onVerificador: () => void
  onPropostas: () => void
  onStream: () => void
  onSegundaTela: () => void
  auxiliarAberta: boolean
}

export function ViewConfig({
  fullscreen,
  onToggleFullscreen,
  onVerificador,
  onPropostas,
  onStream,
  onSegundaTela,
  auxiliarAberta
}: Props) {
  const btn =
    'w-full text-left px-4 py-3 rounded-lg border border-[var(--omni-border)] bg-[var(--omni-bg-elevated)] hover:bg-[var(--omni-bg-hover)] text-sm mb-2'

  return (
    <div className="h-full overflow-y-auto p-6 max-w-lg mx-auto">
      <h2 className="text-lg font-semibold mb-6">{pt.configTitulo}</h2>

      <h3 className="text-sm font-medium text-[var(--omni-text-muted)] mb-2">{pt.idioma}</h3>
      <select
        value="pt-BR"
        disabled
        className="w-full mb-2 px-3 py-2 rounded-lg bg-[var(--omni-bg-base)] border border-[var(--omni-border)] text-sm text-[var(--omni-text-primary)]"
        title={pt.idiomaFuturo}
      >
        <option value="pt-BR">{pt.idiomaPt}</option>
      </select>
      <p className="text-xs text-[var(--omni-text-dim)] mb-1">{pt.idiomaAjuda}</p>
      <p className="text-xs text-[var(--omni-text-dim)] mb-6">{pt.idiomaFuturo}</p>

      <button type="button" className={btn} onClick={onToggleFullscreen}>
        {fullscreen ? pt.telaCheiaSair : pt.telaCheiaEntrar}
      </button>
      <button type="button" className={btn} onClick={onVerificador}>
        {pt.verificarRequisitos}
      </button>
      <button type="button" className={btn} onClick={onPropostas}>
        {pt.caixaPropostas}
      </button>
      <button type="button" className={btn} onClick={onStream}>
        {pt.acompanharIa}
      </button>
      <button type="button" className={btn} onClick={onSegundaTela}>
        {auxiliarAberta ? pt.segundaTelaFechar : pt.segundaTelaAbrir}
      </button>
      <p className="text-xs text-[var(--omni-text-dim)] mt-6">{pt.atalhosModos}</p>
    </div>
  )
}
