import React from 'react'

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
      <h2 className="text-lg font-semibold mb-6">Configurações</h2>
      <button type="button" className={btn} onClick={onToggleFullscreen}>
        {fullscreen ? 'Sair da tela cheia' : 'Entrar em tela cheia'}
      </button>
      <button type="button" className={btn} onClick={onVerificador}>
        Verificar requisitos (RAM, winget, Ollama)
      </button>
      <button type="button" className={btn} onClick={onPropostas}>
        Caixa de propostas
      </button>
      <button type="button" className={btn} onClick={onStream}>
        Acompanhar IA (sondagem)
      </button>
      <button type="button" className={btn} onClick={onSegundaTela}>
        {auxiliarAberta ? 'Fechar segunda tela' : 'Abrir segunda tela'} (R6)
      </button>
      <p className="text-xs text-[var(--omni-text-dim)] mt-6">
        Modos FLEX / FOCO / APRENDIZADO: use Ctrl+Shift+1/2/3 ou a paleta Ctrl+K.
      </p>
    </div>
  )
}
