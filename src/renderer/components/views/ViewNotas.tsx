import React from 'react'
import { NotasWidget } from '../NotasWidget'

interface Props {
  modoFoco: boolean
  tarefaAtualId: number | null
}

export function ViewNotas({ modoFoco, tarefaAtualId }: Props) {
  return (
    <div className="h-full overflow-y-auto p-6 max-w-xl mx-auto">
      <NotasWidget modoFoco={modoFoco} tarefaAtualId={tarefaAtualId} />
    </div>
  )
}
