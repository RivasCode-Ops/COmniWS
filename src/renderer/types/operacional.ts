export type NodeCategoria = 'ferramenta' | 'fluxo' | 'contexto' | 'ambiente' | 'inteligencia'

export type SidebarView =
  | 'hoje'
  | 'workspaces'
  | 'foco'
  | 'tarefas'
  | 'notas'
  | 'ferramentas'
  | 'ambiente'
  | 'config'

export interface OperacionalNodeData {
  id: string
  categoria: NodeCategoria
  nome: string
  subtitulo: string
  acaoLabel: string
  status: 'ok' | 'warn' | 'error' | 'idle'
  icon: string
  payload?: Record<string, unknown>
}

export interface LauncherItem {
  nome: string
  path?: string
  url?: string
  tipo: 'app' | 'site'
}
