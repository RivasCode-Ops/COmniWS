import React from 'react'
import type { OperacionalNodeData } from '../../types/operacional'
import { NodeIcon } from './icons'
import { pt } from '../../i18n'

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
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onDoubleClick={(e) => {
        e.preventDefault()
        onAction()
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter') onAction()
      }}
      className={`
        group text-left w-full min-h-[128px] p-4 rounded-[var(--omni-radius-node)] cursor-pointer
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
        <span className={`w-2 h-2 rounded-full shrink-0 ${STATUS_COLOR[node.status]}`} title={node.status} />
      </div>
      <div className="font-semibold text-sm tracking-wide">{node.nome}</div>
      <div className="text-xs text-[var(--omni-text-muted)] mt-1 line-clamp-2">{node.subtitulo}</div>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          onAction()
        }}
        className="mt-3 w-full py-2 rounded-md text-xs font-semibold bg-[var(--omni-accent-focus)]/15 text-[var(--omni-accent-focus)] border border-[var(--omni-border-active)] hover:bg-[var(--omni-accent-focus)] hover:text-white transition-colors"
      >
        {node.acaoLabel}
      </button>
      <p className="text-[9px] text-[var(--omni-text-dim)] mt-1 opacity-0 group-hover:opacity-100">
        {pt.dicaDuploClique}
      </p>
    </div>
  )
}
