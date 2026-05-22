/**
 * Interface Omni Work — Português (Brasil)
 * Idioma padrão. Inglês: versão futura.
 */
export const pt = {
  appNome: 'Omni Estação de Trabalho',
  appSubtitulo: 'Estação de Trabalho',

  // Sidebar
  navHoje: 'Hoje',
  navEspacos: 'Espaços de trabalho',
  navFoco: 'Foco',
  navTarefas: 'Tarefas',
  navNotas: 'Notas',
  navFerramentas: 'Ferramentas',
  navAmbiente: 'Ambiente',
  navConfig: 'Configurações',

  // Topbar
  buscaPlaceholder: 'Buscar app, tarefa, comando…',
  sair: 'Sair',

  // Modos
  modoFoco: 'Foco',
  modoFlex: 'Flexível',
  modoAprendizado: 'Aprendizado',
  estadoPronto: 'Pronta',

  // Ações rápidas
  iniciarFoco: 'Iniciar foco',
  pausarFoco: 'Pausar foco',
  pausarPomodoro: 'Pausar Pomodoro',
  iniciar: 'Iniciar',

  // View Hoje — blocos
  abrir: 'Abrir',
  abrirNavegador: 'Abrir no navegador',
  appLocal: 'Aplicativo no computador',
  iniciarFocoBloco: 'Iniciar foco',
  pausarFocoBloco: 'Pausar foco',
  pomodoroSub: 'Pomodoro 25 min · modo Foco',
  capturarNota: 'Capturar nota',
  notaRapida: 'Anotação rápida',
  capturar: 'Capturar',
  revisarEntradas: 'Revisar entradas',
  tarefasPendentes: (n: number) => `${n} tarefa(s) pendente(s)`,
  espacoAtivo: 'Espaço de trabalho ativo',
  contextoAtual: 'Seu contexto operacional atual',
  trocar: 'Trocar',
  verificarMaquina: 'Verificar o computador',
  ambienteOk: 'Ambiente em ordem',
  ferramentasAusentes: (n: number) => `${n} ferramenta(s) em falta`,
  inventario: 'Inventário',
  propostas: 'Propostas',
  propostasSub: 'Autorizar ou recusar sugestões',
  abrirCaixa: 'Abrir caixa',

  secFerramentas: 'Ferramentas',
  secFluxo: 'Fluxo',
  secContextoAmbiente: 'Contexto e ambiente',
  secInteligencia: 'Inteligência',

  dicaUso:
    'Clique no botão azul de cada bloco (ex.: «Abrir») ou dê duplo-clique no card. O painel à direita mostra detalhes. Atalho: Ctrl+K.',
  dicaDuploClique: 'Duplo-clique = ação rápida',

  // Painel contextual
  painelTitulo: 'Contexto',
  painelEstacao: 'Estação',
  tarefasInbox: (n: number) => `${n} tarefa(s) na caixa de entrada`,
  ferramentasFalta: (n: number) => `${n} ferramenta(s) em falta`,
  iniciarFocoAgora: 'Iniciar foco agora',
  selecioneBloco: 'Selecione um bloco na área central para ver detalhes e ações.',
  abrirAgora: 'Abrir agora',

  // Foco
  sessaoFoco: 'Sessão de foco',
  iniciarPomodoro: 'Iniciar Pomodoro',
  pausar: 'Pausar',
  resetar: 'Reiniciar',
  focoR3: 'Inventário e sondagem pausados no modo Foco (regra R3). Anotações vão para a fila.',

  // Tarefas
  proximasAcoes: 'Próximas ações',
  novaTarefa: 'Nova tarefa…',
  adicionar: 'Adicionar',
  inboxVazia: 'Caixa de entrada vazia',
  concluir: 'Concluir',
  remover: 'Remover',

  // Ambiente
  ambienteWindows: 'Ambiente Windows',
  atualizarInventario: 'Atualizar inventário',
  pausadoFoco: 'Pausado no modo Foco',
  ferramentaAusente: 'Ferramenta em falta',
  sugerirInstalacao: 'Sugerir instalação',

  // Ferramentas
  ferramentasTitulo: 'Ferramentas',
  tipoSite: 'Site na web',
  tipoApp: 'Aplicativo',

  // Espaços
  espacosTitulo: 'Espaços de trabalho',
  espacoAtivoBadge: 'ativo',

  // Config
  configTitulo: 'Configurações',
  telaCheiaEntrar: 'Entrar em tela cheia',
  telaCheiaSair: 'Sair da tela cheia',
  verificarRequisitos: 'Verificar requisitos (memória, winget, Ollama)',
  caixaPropostas: 'Caixa de propostas',
  acompanharIa: 'Acompanhar IA (sondagem)',
  segundaTelaAbrir: 'Abrir segunda tela',
  segundaTelaFechar: 'Fechar segunda tela',
  atalhosModos: 'Modos Foco / Flexível / Aprendizado: Ctrl+Shift+1, 2 ou 3 — ou Ctrl+K.',
  idioma: 'Idioma',
  idiomaPt: 'Português (Brasil)',
  idiomaAjuda:
    'Toda a interface está em português — você não precisa falar inglês para usar o app.',
  idiomaFuturo: 'Inglês e outros idiomas: versão futura.',

  // Paleta de comandos
  cmdBusca: 'Comando ou busca…',
  cmdNenhum: 'Nenhum comando encontrado',
  cmdGrupoFluxo: 'Fluxo',
  cmdGrupoSistema: 'Sistema',
  cmdGrupoModo: 'Modo',
  cmdGrupoJanela: 'Janela',
  cmdIrFoco: 'Ir para o modo Foco',
  cmdPropostas: 'Abrir caixa de propostas',
  cmdIa: 'Acompanhar IA',
  cmdSegundaTela: 'Segunda tela',
  cmdModoFlex: 'Modo flexível',
  cmdModoAprend: 'Modo aprendizado',
  cmdTelaCheia: 'Alternar tela cheia',

  // Login
  loginMarca: 'OMNI WORK',
  loginTitulo: 'Estação local',
  loginSub: 'No seu computador · tela cheia · operação',
  perfil: 'Perfil',
  perfilPlaceholder: 'Seu nome',
  pin: 'PIN',
  pinPlaceholder: 'Mínimo 4 caracteres',
  criarEntrar: 'Criar perfil e entrar',
  entrar: 'Entrar na estação',
  entrando: 'Entrando…',
  loginRodape: 'Dados ficam só neste PC. Nada instala sem sua autorização (R1).',

  // OmniScript
  iaPergunta: 'Pergunte à IA…',
  iaAnotacaoFoco: 'Anotação (responde após o Foco)…',

  // Toasts (genéricos)
  erroPrefixo: 'Erro: '
} as const

export type Idioma = 'pt-BR'

export function getIdioma(): Idioma {
  return (localStorage.getItem('omni_idioma') as Idioma) || 'pt-BR'
}

export function setIdioma(id: Idioma) {
  localStorage.setItem('omni_idioma', id)
}
