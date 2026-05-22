import React from 'react'
import type { OperacionalNodeData } from '../../types/operacional'
import { NodeIcon } from './icons'

const CAT_BORDER: Record<OperacionalNodeData['categoria'], string> = {
  ferramenta: 'border-l-[var(--omni-text-dim)]',
  fluxo: 'border-l-[var(--omni-cat-fluxo)]',
  contexto: 'border-l-[var(--omni-cat-contexto)]',
  ambiente: 'border-l-[var(--omni-cat-ambiente)]',
  inteligencia: 'border-l-[var(--omni-cat-intel)]'
}

const STATUS_COLOR: Record<OperacionalNodeData['status'], string> = {
  ok: 'bg-[var(--omni-status-ok)]',
  warn: 'bg-[var(--omni-status-warn)]',
  error: 'bg-[var(--omni-status-error)]',
  idle: 'bg-[var(--omni-status-idle)]'
}

interface Props {
  node: OperacionalNodeData
  selected: boolean
  onSelect: () => void
  onAction: () => void
}

export function OperacionalNode({ node, selected, onSelect, onAction }: Props) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`
        group text-left w-full min-h-[128px] p-4 rounded-[var(--omni-radius-node)]
        border border-[var(--omni-border)] border-l-[3px] ${CAT_BORDER[node.categoria]}
        bg-[var(--omni-bg-elevated)] transition-all duration-150
        hover:border-[var(--omni-border-active)] hover:bg-[var(--omni-bg-hover)]
        ${selected ? 'ring-1 ring-[var(--omni-accent-focus)] border-[var(--omni-border-active)] shadow-lg' : ''}
      `}
    >
      <div className="flex justify-between items-start mb-3">
        <span className="text-[var(--omni-text-muted)]">
          <NodeIcon name={node.icon} className="w-7 h-7" />
        </span>
        <span className={`w-2 h-2 rounded-full ${STATUS_COLOR[node.status]}`} title={node.status} />
      </div>
      <div className="font-semibold text-sm tracking-wide">{node.nome}</div>
      <div className="text-xs text-[var(--omni-text-muted)] mt-1 line-clamp-2">{node.subtitulo}</div>
      <span
        role="button"
        tabIndex={0}
        onClick={(e) => {
          e.stopPropagation()
          onAction()
        }}
        onKeyDown={(e) => e.key === 'Enter' && onAction()}
        className="inline-block mt-3 text-xs font-medium text-[var(--omni-accent-focus)] opacity-80 group-hover:opacity-100"
      >
        {node.acaoLabel} →
      </span>
    </button>
  )
}
