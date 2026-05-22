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

  // Multitela
  multitelaAbrir: () => ipcRenderer.invoke('multitela-abrir'),
  multitelaFechar: () => ipcRenderer.invoke('multitela-fechar'),
  multitelaStatus: () => ipcRenderer.invoke('multitela-status'),
  multitelaSyncSolicitar: () => ipcRenderer.invoke('multitela-sync-solicitar'),
  multitelaFocarPrincipal: () => ipcRenderer.invoke('multitela-focar-principal'),
  onMultitelaHeartbeat: (callback: (data: { timestamp: number }) => void) => {
    const handler = (_: unknown, data: { timestamp: number }) => callback(data)
    ipcRenderer.on('multitela-heartbeat', handler)
    return () => ipcRenderer.removeListener('multitela-heartbeat', handler)
  },
  onMultitelaSyncCompleto: (callback: (data: { estado: unknown }) => void) => {
    const handler = (_: unknown, data: { estado: unknown }) => callback(data)
    ipcRenderer.on('multitela-sync-completo', handler)
    return () => ipcRenderer.removeListener('multitela-sync-completo', handler)
  },
  onMultitelaStatus: (callback: (data: unknown) => void) => {
    const handler = (_: unknown, data: unknown) => callback(data)
    ipcRenderer.on('multitela-status', handler)
    return () => ipcRenderer.removeListener('multitela-status', handler)
  },

  // Config e requisitos
  requisitosVerificar: () => ipcRenderer.invoke('requisitos-verificar'),
  configGet: () => ipcRenderer.invoke('config-get'),
  configAutoStart: (enabled: boolean) => ipcRenderer.invoke('config-auto-start', enabled),

  // Launcher
  abrirApp: (path: string) => ipcRenderer.invoke('abrir-app', path),
  abrirSite: (url: string) => ipcRenderer.invoke('abrir-site', url),
  launcherAbrirItem: (item: { tipo: 'app' | 'site'; path?: string; url?: string; nome?: string }) =>
    ipcRenderer.invoke('launcher-abrir-item', item),
  launcherApps: () => ipcRenderer.invoke('launcher-apps'),

  // Auth e sessão (Fase 10)
  authPrecisaSetup: () => ipcRenderer.invoke('auth-precisa-setup'),
  authSetup: (nome: string, pin: string) => ipcRenderer.invoke('auth-setup', nome, pin),
  authLogin: (pin: string, nome?: string) => ipcRenderer.invoke('auth-login', pin, nome),
  authLogout: () => ipcRenderer.invoke('auth-logout'),
  authSessao: () => ipcRenderer.invoke('auth-sessao'),
  onAuthSessao: (callback: (sessao: unknown) => void) => {
    ipcRenderer.on('auth-sessao', (_, sessao) => callback(sessao))
  },
  onAuthLogout: (callback: () => void) => {
    ipcRenderer.on('auth-logout', () => callback())
  },

  // Workspaces
  workspacesListar: () => ipcRenderer.invoke('workspaces-listar'),
  workspacesAtivar: (id: number) => ipcRenderer.invoke('workspaces-ativar', id),

  // Notas
  notasListar: () => ipcRenderer.invoke('notas-listar'),
  notasAdicionar: (corpo: string, titulo?: string, tarefaId?: number) =>
    ipcRenderer.invoke('notas-adicionar', corpo, titulo, tarefaId),
  notasRemover: (id: number) => ipcRenderer.invoke('notas-remover', id),

  // Estação fullscreen
  estacaoSetFullscreen: (ativo: boolean) => ipcRenderer.invoke('estacao-set-fullscreen', ativo),
  estacaoGetFullscreen: () => ipcRenderer.invoke('estacao-get-fullscreen'),

  // Políticas
  politicasGet: () => ipcRenderer.invoke('politicas-get')
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
      ) => Promise<{
        sucesso: boolean
        comando?: string
        mensagem?: string
        executado?: boolean
        motivo?: string
      }>
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
      multitelaAbrir: () => Promise<{ sucesso: boolean; jaAberta?: boolean }>
      multitelaFechar: () => Promise<{ sucesso: boolean; motivo?: string }>
      multitelaStatus: () => Promise<{
        principalAberta: boolean
        auxiliarAberta: boolean
        janelas: number
        sincronizada: boolean
      }>
      multitelaSyncSolicitar: () => Promise<{ estado: unknown; timestamp: number }>
      multitelaFocarPrincipal: () => Promise<{ sucesso: boolean }>
      onMultitelaHeartbeat: (callback: (data: { timestamp: number }) => void) => () => void
      onMultitelaSyncCompleto: (callback: (data: { estado: unknown }) => void) => () => void
      onMultitelaStatus: (callback: (data: unknown) => void) => () => void
      requisitosVerificar: () => Promise<{
        ram: { ok: boolean; valor: number }
        nodeJs: { ok: boolean }
        winget: { ok: boolean }
        ollama: { ok: boolean }
      }>
      configGet: () => Promise<{ autoStart: boolean }>
      configAutoStart: (enabled: boolean) => Promise<{ sucesso: boolean; autoStart: boolean }>
      abrirApp: (path: string) => Promise<{ sucesso: boolean; erro?: string }>
      abrirSite: (url: string) => Promise<{ sucesso: boolean; erro?: string }>
      launcherAbrirItem: (item: {
        tipo: 'app' | 'site'
        path?: string
        url?: string
        nome?: string
      }) => Promise<{ sucesso: boolean; mensagem?: string; motivo?: string }>
      launcherApps: () => Promise<
        Array<{ nome: string; path?: string; url?: string; tipo: 'app' | 'site' }>
      >
      authPrecisaSetup: () => Promise<{ precisaSetup: boolean }>
      authSetup: (
        nome: string,
        pin: string
      ) => Promise<{ sucesso: boolean; usuarioId?: number; motivo?: string }>
      authLogin: (
        pin: string,
        nome?: string
      ) => Promise<{
        sucesso: boolean
        precisaSetup?: boolean
        motivo?: string
        sessao?: {
          sessaoId: number
          usuarioId: number
          usuarioNome: string
          workspaceId: number
          workspaceNome: string
        }
      }>
      authLogout: () => Promise<{ sucesso: boolean }>
      authSessao: () => Promise<{
        sessao: {
          sessaoId: number
          usuarioId: number
          usuarioNome: string
          workspaceId: number
          workspaceNome: string
        } | null
      }>
      onAuthSessao: (callback: (sessao: unknown) => void) => void
      onAuthLogout: (callback: () => void) => void
      workspacesListar: () => Promise<unknown[]>
      workspacesAtivar: (id: number) => Promise<{ sucesso: boolean }>
      notasListar: () => Promise<unknown[]>
      notasAdicionar: (
        corpo: string,
        titulo?: string,
        tarefaId?: number
      ) => Promise<{ id: number; sucesso: boolean }>
      notasRemover: (id: number) => Promise<{ sucesso: boolean }>
      estacaoSetFullscreen: (ativo: boolean) => Promise<{ sucesso: boolean; fullscreen: boolean }>
      estacaoGetFullscreen: () => Promise<{ fullscreen: boolean; fullscreenPadrao: boolean }>
      politicasGet: () => Promise<{ whitelist: string[]; nivelInstalacao: string }>
    }
  }
}
