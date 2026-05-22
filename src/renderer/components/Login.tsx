import React, { useState, useEffect } from 'react'

interface LoginProps {
  onSuccess: () => void
}

export function Login({ onSuccess }: LoginProps) {
  const [precisaSetup, setPrecisaSetup] = useState(false)
  const [nome, setNome] = useState('')
  const [pin, setPin] = useState('')
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)

  useEffect(() => {
    window.electronAPI.authPrecisaSetup().then((r) => setPrecisaSetup(r.precisaSetup))
    window.electronAPI.authSessao().then((r) => {
      if (r.sessao) onSuccess()
    })
  }, [onSuccess])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErro('')
    setCarregando(true)

    try {
      if (precisaSetup) {
        const setup = await window.electronAPI.authSetup(nome, pin)
        if (!setup.sucesso) {
          setErro(setup.motivo || 'Falha ao criar perfil')
          return
        }
      }

      const login = await window.electronAPI.authLogin(pin, nome || undefined)
      if (login.precisaSetup) {
        setPrecisaSetup(true)
        setErro('Crie seu perfil primeiro')
        return
      }
      if (!login.sucesso) {
        setErro(login.motivo || 'Login falhou')
        return
      }
      onSuccess()
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div className="omni-shell min-h-screen flex items-center justify-center p-8">
      <div className="w-full max-w-md rounded-[var(--omni-radius-node)] p-8 border border-[var(--omni-border)] bg-[var(--omni-bg-elevated)] shadow-2xl">
        <div className="text-center mb-8">
          <div className="omni-mono text-xs tracking-[0.3em] text-[var(--omni-text-dim)]">OMNI WORK</div>
          <h1 className="text-xl font-semibold mt-2">Estação local</h1>
          <p className="text-xs text-[var(--omni-text-muted)] mt-1">Desktop · fullscreen · operação</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {(precisaSetup || nome) && (
            <div>
              <label className="block text-[11px] uppercase tracking-wide text-[var(--omni-text-dim)] mb-1">
                Perfil
              </label>
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg bg-[var(--omni-bg-base)] border border-[var(--omni-border)] text-sm outline-none focus:border-[var(--omni-border-active)]"
                placeholder="Seu nome"
                required={precisaSetup}
              />
            </div>
          )}
          <div>
            <label className="block text-[11px] uppercase tracking-wide text-[var(--omni-text-dim)] mb-1">PIN</label>
            <input
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg bg-[var(--omni-bg-base)] border border-[var(--omni-border)] omni-mono text-sm outline-none focus:border-[var(--omni-border-active)]"
              placeholder="••••"
              minLength={4}
              required
            />
          </div>

          {erro && (
            <p className="text-xs text-[var(--omni-status-error)] text-center py-2 rounded bg-red-950/30">{erro}</p>
          )}

          <button
            type="submit"
            disabled={carregando}
            className="w-full py-3 rounded-lg bg-[var(--omni-accent-focus)] text-sm font-semibold disabled:opacity-50"
          >
            {carregando ? 'Entrando…' : precisaSetup ? 'Criar e entrar' : 'Entrar na estação'}
          </button>
        </form>

        <p className="text-[10px] text-[var(--omni-text-dim)] text-center mt-6">
          Dados no seu PC. Automações exigem autorização (R1).
        </p>
      </div>
    </div>
  )
}
