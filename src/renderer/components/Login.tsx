import React, { useState, useEffect } from 'react'

interface LoginProps {
  onSuccess: (destino: 'launcher') => void
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
      if (r.sessao) onSuccess('launcher')
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
      onSuccess('launcher')
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-8">
      <div className="w-full max-w-md bg-gray-800 rounded-xl p-8 shadow-2xl border border-gray-700">
        <h1 className="text-2xl font-bold text-center mb-2">Omni Work Station</h1>
        <p className="text-gray-400 text-center text-sm mb-8">
          {precisaSetup ? 'Crie seu perfil local (sem nuvem)' : 'Entre com seu PIN'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {(precisaSetup || nome) && (
            <div>
              <label className="block text-sm text-gray-400 mb-1">Nome do perfil</label>
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3"
                placeholder="Ex.: Rivas"
                required={precisaSetup}
              />
            </div>
          )}
          <div>
            <label className="block text-sm text-gray-400 mb-1">PIN</label>
            <input
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3"
              placeholder="Mínimo 4 caracteres"
              minLength={4}
              required
            />
          </div>

          {erro && (
            <p className="text-red-400 text-sm text-center bg-red-900/30 p-2 rounded">{erro}</p>
          )}

          <button
            type="submit"
            disabled={carregando}
            className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-lg font-semibold transition disabled:opacity-50"
          >
            {carregando ? '...' : precisaSetup ? 'Criar e entrar' : 'Entrar'}
          </button>
        </form>

        <p className="text-xs text-gray-500 text-center mt-6">
          Dados locais no seu PC. Nada instala sem autorização (R1).
        </p>
      </div>
    </div>
  )
}
