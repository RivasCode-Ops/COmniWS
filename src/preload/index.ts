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

  // Ambiente (winget)
  ambienteInventario: () => ipcRenderer.invoke('ambiente-inventario'),
  ambienteInstalar: (appId: string, appNome: string) =>
    ipcRenderer.invoke('ambiente-instalar', appId, appNome),

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
      ambienteInventario: () => Promise<{
        instalados: Array<{ nome: string; id: string; versao: string }>
        ausentes: Array<{ nome: string; id: string }>
        totalInstalados: number
        totalAusentes: number
        timestamp: string
      }>
      ambienteInstalar: (
        appId: string,
        appNome: string
      ) => Promise<{
        sucesso: boolean
        precisaAutorizacao?: boolean
        comando?: string
        mensagem?: string
      }>
      abrirApp: (path: string) => Promise<{ sucesso: boolean; erro?: string }>
      abrirSite: (url: string) => Promise<{ sucesso: boolean; erro?: string }>
    }
  }
}
