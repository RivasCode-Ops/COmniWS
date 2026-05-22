import { useEffect } from 'react'

export function useAtalhosTeclado({
  onOmniScript,
  onPropostas,
  onModoFoco,
  onModoFlex,
  onModoAprendizado
}: {
  onOmniScript?: () => void
  onPropostas?: () => void
  onModoFoco?: () => void
  onModoFlex?: () => void
  onModoAprendizado?: () => void
}) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'F') {
        e.preventDefault()
        onOmniScript?.()
      }
      if (e.ctrlKey && e.shiftKey && e.key === 'P') {
        e.preventDefault()
        onPropostas?.()
      }
      if (e.ctrlKey && e.shiftKey && e.key === '1') {
        e.preventDefault()
        onModoFoco?.()
      }
      if (e.ctrlKey && e.shiftKey && e.key === '2') {
        e.preventDefault()
        onModoFlex?.()
      }
      if (e.ctrlKey && e.shiftKey && e.key === '3') {
        e.preventDefault()
        onModoAprendizado?.()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onOmniScript, onPropostas, onModoFoco, onModoFlex, onModoAprendizado])
}
