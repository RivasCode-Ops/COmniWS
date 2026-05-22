import React, { useState, useEffect, useRef } from 'react'

interface StreamPensamentoProps {
  visivel: boolean
  onClose: () => void
}

export function StreamPensamento({ visivel, onClose }: StreamPensamentoProps) {
  const [mensagens, setMensagens] = useState<string[]>([])
  const [sondagemAtiva, setSondagemAtiva] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!visivel) return

    const unsubscribe = window.electronAPI.onIaStream((mensagem: string) => {
      setMensagens((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${mensagem}`])
    })

    window.electronAPI.sondagemStatus().then((status: { ativa: boolean }) => {
      setSondagemAtiva(status.ativa)
    })

    return () => {
      if (unsubscribe) unsubscribe()
    }
  }, [visivel])

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }, [mensagens])

  const toggleSondagem = async () => {
    const result = await window.electronAPI.sondagemToggle()
    setSondagemAtiva(result.ativa)
  }

  const executarAgora = async () => {
    await window.electronAPI.sondagemExecutarAgora()
  }

  if (!visivel) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg w-3/4 max-w-4xl h-2/3 flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <h2 className="text-xl font-semibold">🧠 IA Autônoma - Stream de Pensamento</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">
            ×
          </button>
        </div>

        <div className="flex gap-2 p-4 border-b border-gray-700">
          <button
            onClick={toggleSondagem}
            className={`px-3 py-1 rounded ${sondagemAtiva ? 'bg-green-600' : 'bg-red-600'}`}
          >
            {sondagemAtiva ? '🔘 Ativa' : '⏸ Pausada'}
          </button>
          <button
            onClick={executarAgora}
            className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded"
          >
            ▶ Executar agora
          </button>
        </div>

        <div ref={containerRef} className="flex-1 overflow-y-auto p-4 font-mono text-sm">
          {mensagens.length === 0 ? (
            <div className="text-gray-500 text-center py-8">
              Aguardando atividade da IA autônoma...
            </div>
          ) : (
            mensagens.map((msg, idx) => (
              <div key={idx} className="mb-1 text-gray-300 border-l-2 border-blue-500 pl-2">
                {msg}
              </div>
            ))
          )}
        </div>

        <div className="p-4 border-t border-gray-700 text-xs text-gray-500">
          A IA sondagem busca novidades a cada 4 horas. Propostas vão para a Caixa de Propostas.
        </div>
      </div>
    </div>
  )
}
