import React, { useState, useEffect } from 'react'

interface Proposta {
  id: number
  titulo: string
  descricao: string
  tipo: string
  acao: string
  dados: string
  status: string
  created_at: string
}

interface CaixaPropostasProps {
  onPropostaAcao?: () => void
}

export function CaixaPropostas({ onPropostaAcao }: CaixaPropostasProps) {
  const [propostas, setPropostas] = useState<Proposta[]>([])
  const [auditLog, setAuditLog] = useState<
    Array<{ id: number; acao: string; tipo_recurso: string; recurso_id: number; created_at: string }>
  >([])
  const [carregando, setCarregando] = useState(true)
  const [mostrarLog, setMostrarLog] = useState(false)

  const carregarPropostas = async () => {
    const lista = await window.electronAPI.propostasListar()
    setPropostas(lista as Proposta[])
    setCarregando(false)
  }

  const carregarAuditLog = async () => {
    const log = await window.electronAPI.auditLogListar(20)
    setAuditLog(
      log as Array<{
        id: number
        acao: string
        tipo_recurso: string
        recurso_id: number
        created_at: string
      }>
    )
  }

  useEffect(() => {
    carregarPropostas()
    carregarAuditLog()

    window.electronAPI.onNovaProposta(() => {
      carregarPropostas()
    })

    window.electronAPI.onPropostaAtualizada(() => {
      carregarPropostas()
      carregarAuditLog()
      if (onPropostaAcao) onPropostaAcao()
    })
  }, [])

  const autorizar = async (id: number) => {
    const result = await window.electronAPI.propostasAutorizar(id)
    if (result.comando) {
      alert(`Para instalar, execute no terminal:\n${result.comando}`)
    }
    carregarPropostas()
    carregarAuditLog()
  }

  const recusar = async (id: number, paraSempre: boolean) => {
    await window.electronAPI.propostasRecusar(id, paraSempre)
  }

  const agendar = async (id: number) => {
    const dataHora = prompt('Agendar para (data/hora):', new Date().toISOString())
    if (dataHora) {
      await window.electronAPI.propostasAgendar(id, dataHora)
      carregarPropostas()
      carregarAuditLog()
    }
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">📦 Caixa de Propostas</h2>
        <button
          onClick={() => setMostrarLog(!mostrarLog)}
          className="text-sm text-gray-400 hover:text-white"
        >
          {mostrarLog ? '📋 Esconder Log' : '📋 Ver Log'}
        </button>
      </div>

      {carregando ? (
        <div className="text-center py-8 text-gray-400">Carregando propostas...</div>
      ) : propostas.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          📭 Nenhuma proposta pendente. A IA vai sugerir melhorias aqui.
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {propostas.map((proposta) => (
            <div key={proposta.id} className="bg-gray-700 rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-semibold">{proposta.titulo}</h3>
                  <p className="text-sm text-gray-300 mt-1">{proposta.descricao}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(proposta.created_at).toLocaleString()}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 ml-4 justify-end">
                  <button
                    onClick={() => autorizar(proposta.id)}
                    className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-sm transition"
                  >
                    ✅ Autorizar
                  </button>
                  <button
                    onClick={() => recusar(proposta.id, false)}
                    className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm transition"
                  >
                    ❌ Recusar
                  </button>
                  <button
                    onClick={() => agendar(proposta.id)}
                    className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-sm transition"
                  >
                    📅 Agendar
                  </button>
                  <button
                    onClick={() => recusar(proposta.id, true)}
                    className="bg-gray-600 hover:bg-gray-500 px-3 py-1 rounded text-sm transition"
                    title="Recusar para sempre (não sugerir novamente)"
                  >
                    🚫 Recusar sempre
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {mostrarLog && (
        <div className="mt-4 pt-4 border-t border-gray-700">
          <h3 className="text-sm font-semibold mb-2 text-gray-400">📋 Últimas ações</h3>
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {auditLog.length === 0 ? (
              <p className="text-xs text-gray-500">Nenhuma ação registrada</p>
            ) : (
              auditLog.map((log) => (
                <div key={log.id} className="text-xs text-gray-400">
                  [{new Date(log.created_at).toLocaleTimeString()}] {log.acao}: {log.tipo_recurso} #
                  {log.recurso_id}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
