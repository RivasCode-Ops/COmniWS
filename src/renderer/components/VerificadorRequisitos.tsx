import React, { useState, useEffect } from 'react'

interface Requisitos {
  ram: { ok: boolean; valor: number }
  nodeJs: { ok: boolean }
  winget: { ok: boolean }
  ollama: { ok: boolean }
}

export function VerificadorRequisitos({ onFechar }: { onFechar: () => void }) {
  const [requisitos, setRequisitos] = useState<Requisitos | null>(null)

  useEffect(() => {
    window.electronAPI.requisitosVerificar().then(setRequisitos)
  }, [])

  if (!requisitos) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 text-gray-900 dark:text-white">
          Verificando requisitos...
        </div>
      </div>
    )
  }

  const todosOk = requisitos.ram.ok && requisitos.winget.ok

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full text-gray-900 dark:text-white">
        <h2 className="text-xl font-semibold mb-4">🔧 Verificação de Requisitos</h2>

        <div className="space-y-3">
          <div className="flex justify-between">
            <span>RAM do sistema:</span>
            <span className={requisitos.ram.ok ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
              {requisitos.ram.valor.toFixed(1)} GB {requisitos.ram.ok ? '✅' : '❌ (mín. 4GB)'}
            </span>
          </div>

          <div className="flex justify-between">
            <span>Node.js (app):</span>
            <span className="text-green-600 dark:text-green-400">✅ Embutido</span>
          </div>

          <div className="flex justify-between">
            <span>Winget:</span>
            <span className={requisitos.winget.ok ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
              {requisitos.winget.ok ? '✅ Disponível' : '❌ Não encontrado'}
            </span>
          </div>

          <div className="flex justify-between">
            <span>Ollama (IA):</span>
            <span className={requisitos.ollama.ok ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'}>
              {requisitos.ollama.ok ? '✅ Online' : '⚠️ Offline (opcional)'}
            </span>
          </div>
        </div>

        {!todosOk && (
          <div className="mt-4 p-3 bg-yellow-100 dark:bg-yellow-900 rounded text-sm text-yellow-900 dark:text-yellow-100">
            ⚠️ Alguns requisitos não atendidos. A IA autônoma pode não funcionar totalmente.
          </div>
        )}

        <button
          onClick={onFechar}
          className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded transition"
        >
          Fechar
        </button>
      </div>
    </div>
  )
}
