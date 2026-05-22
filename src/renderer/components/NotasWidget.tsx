import React, { useState, useEffect } from 'react'

interface Nota {
  id: number
  titulo: string | null
  corpo: string
  tarefa_id: number | null
  created_at: string
}

interface NotasWidgetProps {
  modoFoco: boolean
  tarefaAtualId?: number | null
}

export function NotasWidget({ modoFoco, tarefaAtualId }: NotasWidgetProps) {
  const [notas, setNotas] = useState<Nota[]>([])
  const [corpo, setCorpo] = useState('')
  const [titulo, setTitulo] = useState('')

  const carregar = async () => {
    const lista = await window.electronAPI.notasListar()
    setNotas(lista as Nota[])
  }

  useEffect(() => {
    carregar()
  }, [])

  const adicionar = async () => {
    if (!corpo.trim()) return
    await window.electronAPI.notasAdicionar(
      corpo.trim(),
      titulo.trim() || undefined,
      tarefaAtualId || undefined
    )
    setCorpo('')
    setTitulo('')
    carregar()
  }

  return (
    <div className="rounded-[var(--omni-radius-node)] p-4 border border-[var(--omni-border)] bg-[var(--omni-bg-elevated)]">
      <h2 className="text-sm font-semibold mb-4 text-[var(--omni-text-primary)]">Notas inteligentes</h2>

      <div className="flex flex-col gap-2 mb-4">
        <input
          type="text"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          placeholder="Título (opcional)"
          className="bg-[var(--omni-bg-base)] border border-[var(--omni-border)] rounded-lg p-2 text-sm w-full"
        />
        <textarea
          value={corpo}
          onChange={(e) => setCorpo(e.target.value)}
          placeholder={
            modoFoco ? 'Anotação rápida (foco ativo)...' : 'Capturar ideia, link, lembrete...'
          }
          rows={2}
          className="bg-[var(--omni-bg-base)] border border-[var(--omni-border)] rounded-lg p-2 text-sm resize-none w-full"
        />
        <button
          onClick={adicionar}
          className="bg-[var(--omni-accent-focus)] hover:opacity-90 py-2 rounded-lg text-sm self-end px-4"
        >
          + Salvar nota
        </button>
      </div>

      <div className="space-y-2 max-h-40 overflow-y-auto">
        {notas.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-4">Nenhuma nota ainda</p>
        ) : (
          notas.slice(0, 8).map((n) => (
            <div key={n.id} className="p-2 bg-gray-700 rounded text-sm flex justify-between gap-2">
              <div className="flex-1 min-w-0">
                {n.titulo && <div className="font-medium text-gray-300">{n.titulo}</div>}
                <div className="text-gray-400 truncate">{n.corpo}</div>
              </div>
              <button
                onClick={() => window.electronAPI.notasRemover(n.id).then(carregar)}
                className="text-red-400 shrink-0"
                title="Remover"
              >
                ×
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
