import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  // Estado
  getEstado: () => ipcRenderer.invoke('get-estado'),
  setModo: (modo: 'FOCO' | 'FLEX' | 'APRENDIZADO') => ipcRenderer.invoke('set-modo', modo),
  onEstadoAtualizado: (callback: (estado: unknown) => void) => {
    ipcRenderer.on('estado-atualizado', (_, estado) => callback(estado))
  },

  // Pomodoro
  pomodoroIniciar: (tarefaId?: number, tarefaTitulo?: string) =>
    ipcRenderer.invoke('pomodoro-iniciar', tarefaId, tarefaTitulo),
  pomodoroPausar: () => ipcRenderer.invoke('pomodoro-pausar'),
  pomodoroResetar: () => ipcRenderer.invoke('pomodoro-resetar'),
  onPomodoroTerminado: (callback: () => void) => {
    ipcRenderer.on('pomodoro-terminado', () => callback())
  },
  onProcessarBuffer: (callback: (anotacoes: string[]) => void) => {
    ipcRenderer.on('processar-buffer', (_, anotacoes) => callback(anotacoes))
  },

  // IA e OmniScript
  iaPerguntar: (pergunta: string) => ipcRenderer.invoke('ia-perguntar', pergunta),
  iaAnotar: (anotacao: string) => ipcRenderer.invoke('ia-anotar', anotacao),
  iaProcessarBuffer: () => ipcRenderer.invoke('ia-processar-buffer'),
  iaHistorico: () => ipcRenderer.invoke('ia-historico'),

  // Tarefas GTD
  tarefasListar: () => ipcRenderer.invoke('tarefas-listar'),
  tarefasAdicionar: (titulo: string) => ipcRenderer.invoke('tarefas-adicionar', titulo),
  tarefasConcluir: (id: number) => ipcRenderer.invoke('tarefas-concluir', id),
  tarefasRemover: (id: number) => ipcRenderer.invoke('tarefas-remover', id),

  // Propostas
  propostasListar: () => ipcRenderer.invoke('propostas-listar'),
  propostasCriar: (titulo: string, descricao: string, tipo: string, acao: string, dados?: unknown) =>
    ipcRenderer.invoke('propostas-criar', titulo, descricao, tipo, acao, dados),
  propostasAutorizar: (id: number) => ipcRenderer.invoke('propostas-autorizar', id),
  propostasRecusar: (id: number, paraSempre: boolean) =>
    ipcRenderer.invoke('propostas-recusar', id, paraSempre),
  propostasAgendar: (id: number, dataHora: string) =>
    ipcRenderer.invoke('propostas-agendar', id, dataHora),
  onNovaProposta: (callback: (proposta: { id: number; titulo: string; descricao: string }) => void) => {
    ipcRenderer.on('nova-proposta', (_, proposta) => callback(proposta))
  },
  onPropostaAtualizada: (callback: (data: { id: number; status: string }) => void) => {
    ipcRenderer.on('proposta-atualizada', (_, data) => callback(data))
  },
  auditLogListar: (limite?: number) => ipcRenderer.invoke('audit-log-listar', limite),

  // Ambiente (winget)
  ambienteInventario: () => ipcRenderer.invoke('ambiente-inventario'),
  ambienteSugerirInstalacao: (appId: string, appNome: string) =>
    ipcRenderer.invoke('ambiente-sugerir-instalacao', appId, appNome),

  // Sondagem IA
  onIaStream: (callback: (mensagem: string) => void) => {
    const handler = (_: unknown, mensagem: string) => callback(mensagem)
    ipcRenderer.on('ia-stream', handler)
    return () => ipcRenderer.removeListener('ia-stream', handler)
  },
  sondagemStatus: () => ipcRenderer.invoke('sondagem-status'),
  sondagemToggle: () => ipcRenderer.invoke('sondagem-toggle'),
  sondagemExecutarAgora: () => ipcRenderer.invoke('sondagem-executar-agora'),

  // Launcher
  abrirApp: (path: string) => ipcRenderer.invoke('abrir-app', path),
  abrirSite: (url: string) => ipcRenderer.invoke('abrir-site', url)
})

declare global {
  interface Window {
    electronAPI: {
      getEstado: () => Promise<unknown>
      setModo: (modo: 'FOCO' | 'FLEX' | 'APRENDIZADO') => Promise<unknown>
      onEstadoAtualizado: (callback: (estado: unknown) => void) => void
      pomodoroIniciar: (
        tarefaId?: number,
        tarefaTitulo?: string
      ) => Promise<{ sucesso: boolean; motivo?: string }>
      pomodoroPausar: () => Promise<{ sucesso: boolean }>
      pomodoroResetar: () => Promise<{ sucesso: boolean }>
      onPomodoroTerminado: (callback: () => void) => void
      onProcessarBuffer: (callback: (anotacoes: string[]) => void) => void
      iaPerguntar: (pergunta: string) => Promise<{ pergunta: string; resposta: string }>
      iaAnotar: (
        anotacao: string
      ) => Promise<{
        sucesso: boolean
        bufferizado: boolean
        tamanhoBuffer?: number
        precisaIA?: boolean
        anotacao?: string
      }>
      iaProcessarBuffer: () => Promise<{
        sucesso: boolean
        respostas: Array<{ pergunta: string; resposta: string }>
      }>
      iaHistorico: () => Promise<unknown[]>
      tarefasListar: () => Promise<unknown[]>
      tarefasAdicionar: (titulo: string) => Promise<{ id: number; titulo: string }>
      tarefasConcluir: (id: number) => Promise<{ sucesso: boolean }>
      tarefasRemover: (id: number) => Promise<{ sucesso: boolean }>
      propostasListar: () => Promise<unknown[]>
      propostasCriar: (
        titulo: string,
        descricao: string,
        tipo: string,
        acao: string,
        dados?: unknown
      ) => Promise<{ id: number }>
      propostasAutorizar: (
        id: number
      ) => Promise<{ sucesso: boolean; comando?: string; mensagem?: string; motivo?: string }>
      propostasRecusar: (id: number, paraSempre: boolean) => Promise<{ sucesso: boolean }>
      propostasAgendar: (id: number, dataHora: string) => Promise<{ sucesso: boolean }>
      onNovaProposta: (callback: (proposta: { id: number; titulo: string; descricao: string }) => void) => void
      onPropostaAtualizada: (callback: (data: { id: number; status: string }) => void) => void
      auditLogListar: (limite?: number) => Promise<unknown[]>
      ambienteInventario: () => Promise<{
        instalados: Array<{ nome: string; id: string; versao: string }>
        ausentes: Array<{ nome: string; id: string }>
        totalInstalados: number
        totalAusentes: number
        timestamp: string
      }>
      ambienteSugerirInstalacao: (
        appId: string,
        appNome: string
      ) => Promise<{ sucesso: boolean; propostaId: number }>
      onIaStream: (callback: (mensagem: string) => void) => () => void
      sondagemStatus: () => Promise<{ ativa: boolean }>
      sondagemToggle: () => Promise<{ ativa: boolean }>
      sondagemExecutarAgora: () => Promise<{ sucesso: boolean }>
      abrirApp: (path: string) => Promise<{ sucesso: boolean; erro?: string }>
      abrirSite: (url: string) => Promise<{ sucesso: boolean; erro?: string }>
    }
  }
}
