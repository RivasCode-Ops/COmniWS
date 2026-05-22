import React, { useState, useEffect, useRef } from 'react'

interface Estado {
  modo: 'FOCO' | 'FLEX' | 'APRENDIZADO'
  pomodoroAtivo: boolean
  tempoRestante: number
  tarefaAtualId: number | null
  tarefaAtualTitulo: string | null
}

export function TelaAuxiliar() {
  const [estado, setEstado] = useState<Estado>({
    modo: 'FLEX',
    pomodoroAtivo: false,
    tempoRestante: 25 * 60,
    tarefaAtualId: null,
    tarefaAtualTitulo: null
  })
  const [syncOk, setSyncOk] = useState(true)
  const ultimoHeartbeatRef = useRef(Date.now())

  useEffect(() => {
    window.electronAPI.multitelaSyncSolicitar().then((data) => {
      setEstado(data.estado as Estado)
    })

    window.electronAPI.onEstadoAtualizado((e) => setEstado(e as Estado))
    window.electronAPI.onMultitelaSyncCompleto((data) => {
      setEstado(data.estado as Estado)
      ultimoHeartbeatRef.current = Date.now()
      setSyncOk(true)
    })

    const offHeartbeat = window.electronAPI.onMultitelaHeartbeat(() => {
      ultimoHeartbeatRef.current = Date.now()
      setSyncOk(true)
    })

    const interval = setInterval(() => {
      setSyncOk(Date.now() - ultimoHeartbeatRef.current < 6000)
    }, 1000)

    return () => {
      offHeartbeat()
      clearInterval(interval)
    }
  }, [])

  const formatarTempo = (segundos: number) => {
    const minutos = Math.floor(segundos / 60)
    const segs = segundos % 60
    return `${minutos.toString().padStart(2, '0')}:${segs.toString().padStart(2, '0')}`
  }

  const getModoCor = () => {
    switch (estado.modo) {
      case 'FOCO':
        return 'text-green-400'
      case 'FLEX':
        return 'text-yellow-400'
      case 'APRENDIZADO':
        return 'text-purple-400'
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-lg font-bold">OmniWS — Auxiliar</h1>
        <div className="flex items-center gap-2 text-xs">
          <span className={`w-2 h-2 rounded-full ${syncOk ? 'bg-green-500' : 'bg-red-500'}`} />
          {syncOk ? 'Sincronizado' : 'Reconectando...'}
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <p className={`text-sm font-semibold mb-2 ${getModoCor()}`}>
          {estado.modo === 'FOCO' && '🎯 FOCO'}
          {estado.modo === 'FLEX' && '🔄 FLEX'}
          {estado.modo === 'APRENDIZADO' && '🧠 APRENDIZADO'}
        </p>

        <div className="text-8xl font-mono font-bold mb-6">{formatarTempo(estado.tempoRestante)}</div>

        {estado.pomodoroAtivo && (
          <p className="text-green-400 text-sm mb-4 animate-pulse">Pomodoro ativo</p>
        )}

        {estado.tarefaAtualTitulo ? (
          <p className="text-gray-400 text-sm max-w-xs">📋 {estado.tarefaAtualTitulo}</p>
        ) : (
          <p className="text-gray-600 text-sm">Nenhuma tarefa associada</p>
        )}
      </div>

      <button
        onClick={() => window.electronAPI.multitelaFocarPrincipal()}
        className="w-full bg-gray-700 hover:bg-gray-600 py-2 rounded-lg text-sm transition"
      >
        ↩ Voltar para janela principal
      </button>
    </div>
  )
}
