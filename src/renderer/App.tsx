import React, { useState, useEffect, useRef } from 'react'

interface Estado {
  modo: 'FOCO' | 'FLEX' | 'APRENDIZADO'
  pomodoroAtivo: boolean
  tempoRestante: number
  tarefaAtualId: number | null
  tarefaAtualTitulo: string | null
}

interface Tarefa {
  id: number
  titulo: string
  status: string
  prioridade: string
  concluida: number
  created_at: string
}

interface MensagemIA {
  tipo: 'pergunta' | 'resposta'
  texto: string
  timestamp: Date
}

interface Inventario {
  instalados: Array<{ nome: string; id: string; versao: string }>
  ausentes: Array<{ nome: string; id: string }>
  totalInstalados: number
  totalAusentes: number
}

function App() {
  const [estado, setEstado] = useState<Estado>({
    modo: 'FLEX',
    pomodoroAtivo: false,
    tempoRestante: 25 * 60,
    tarefaAtualId: null,
    tarefaAtualTitulo: null
  })

  const [tarefas, setTarefas] = useState<Tarefa[]>([])
  const [novaTarefa, setNovaTarefa] = useState('')
  const [mensagemNotificacao, setMensagemNotificacao] = useState('')

  const [inputOmniScript, setInputOmniScript] = useState('')
  const [mensagensIA, setMensagensIA] = useState<MensagemIA[]>([])
  const [iaPensando, setIaPensando] = useState(false)
  const [modoOllamaOffline, setModoOllamaOffline] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)

  const [inventario, setInventario] = useState<Inventario | null>(null)
  const [carregandoInventario, setCarregandoInventario] = useState(false)

  const carregarTarefas = async () => {
    const lista = await window.electronAPI.tarefasListar()
    setTarefas(lista as Tarefa[])
  }

  const carregarHistoricoIA = async () => {
    const historico = await window.electronAPI.iaHistorico()
    const msgs: MensagemIA[] = []
    for (const item of (historico as Array<{ pergunta: string; resposta: string; created_at: string }>).slice(-20)) {
      msgs.push({ tipo: 'pergunta', texto: item.pergunta, timestamp: new Date(item.created_at) })
      msgs.push({ tipo: 'resposta', texto: item.resposta, timestamp: new Date(item.created_at) })
    }
    setMensagensIA(msgs)
  }

  const carregarInventario = async () => {
    setCarregandoInventario(true)
    try {
      const data = await window.electronAPI.ambienteInventario()
      setInventario(data)
    } catch (error) {
      console.error('Erro ao carregar inventário:', error)
    }
    setCarregandoInventario(false)
  }

  useEffect(() => {
    window.electronAPI.getEstado().then((e) => setEstado(e as Estado))
    window.electronAPI.onEstadoAtualizado((e) => setEstado(e as Estado))
    window.electronAPI.onPomodoroTerminado(() => {
      setMensagemNotificacao('✅ Pomodoro concluído! Hora da pausa.')
      setTimeout(() => setMensagemNotificacao(''), 5000)
    })
    window.electronAPI.onProcessarBuffer(async () => {
      setMensagemNotificacao('📝 Processando anotações do FOCO...')
      const result = await window.electronAPI.iaProcessarBuffer()
      if (result.respostas) {
        for (const r of result.respostas) {
          setMensagensIA((prev) => [
            ...prev,
            { tipo: 'pergunta', texto: r.pergunta, timestamp: new Date() },
            { tipo: 'resposta', texto: r.resposta, timestamp: new Date() }
          ])
        }
      }
      setMensagemNotificacao('')
    })
    carregarTarefas()
    carregarHistoricoIA()
  }, [])

  useEffect(() => {
    if (estado.modo !== 'FOCO') {
      carregarInventario()
    }
  }, [estado.modo])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [mensagensIA])

  const adicionarTarefa = async () => {
    if (novaTarefa.trim() === '') return
    await window.electronAPI.tarefasAdicionar(novaTarefa)
    setNovaTarefa('')
    carregarTarefas()
  }

  const concluirTarefa = async (id: number) => {
    await window.electronAPI.tarefasConcluir(id)
    carregarTarefas()
  }

  const removerTarefa = async (id: number) => {
    await window.electronAPI.tarefasRemover(id)
    carregarTarefas()
  }

  const iniciarPomodoro = async (tarefaId?: number, tarefaTitulo?: string) => {
    await window.electronAPI.pomodoroIniciar(tarefaId, tarefaTitulo)
  }

  const pausarPomodoro = async () => {
    await window.electronAPI.pomodoroPausar()
  }

  const resetarPomodoro = async () => {
    await window.electronAPI.pomodoroResetar()
  }

  const enviarOmniScript = async () => {
    if (inputOmniScript.trim() === '') return
    const texto = inputOmniScript
    setInputOmniScript('')

    setMensagensIA((prev) => [...prev, { tipo: 'pergunta', texto, timestamp: new Date() }])

    if (estado.modo === 'FOCO') {
      const result = await window.electronAPI.iaAnotar(texto)
      if (result.bufferizado) {
        setMensagensIA((prev) => [
          ...prev,
          {
            tipo: 'resposta',
            texto: `📝 Anotação salva (buffer: ${result.tamanhoBuffer} anotações). Responderei após o FOCO.`,
            timestamp: new Date()
          }
        ])
      }
    } else {
      setIaPensando(true)
      try {
        const result = await window.electronAPI.iaPerguntar(texto)
        setMensagensIA((prev) => [
          ...prev,
          { tipo: 'resposta', texto: result.resposta, timestamp: new Date() }
        ])
        setModoOllamaOffline(result.resposta.includes('IA offline'))
      } catch {
        setModoOllamaOffline(true)
        setMensagensIA((prev) => [
          ...prev,
          {
            tipo: 'resposta',
            texto: '⚠️ Ollama offline. Instale o Ollama (ollama.com) e rode: ollama run llama3.2:3b',
            timestamp: new Date()
          }
        ])
      }
      setIaPensando(false)
    }
  }

  const formatarTempo = (segundos: number) => {
    const minutos = Math.floor(segundos / 60)
    const segs = segundos % 60
    return `${minutos.toString().padStart(2, '0')}:${segs.toString().padStart(2, '0')}`
  }

  const getModoCor = () => {
    switch (estado.modo) {
      case 'FOCO':
        return 'bg-green-500'
      case 'FLEX':
        return 'bg-yellow-500'
      case 'APRENDIZADO':
        return 'bg-purple-500'
    }
  }

  const getModoLabel = () => {
    switch (estado.modo) {
      case 'FOCO':
        return '🎯 FOCO'
      case 'FLEX':
        return '🔄 FLEX'
      case 'APRENDIZADO':
        return '🧠 APRENDIZADO'
    }
  }

  const APPS_SUGERIDOS = [
    {
      nome: 'Cursor',
      path: 'C:\\Users\\%USERNAME%\\AppData\\Local\\Programs\\cursor\\Cursor.exe',
      tipo: 'app' as const
    },
    { nome: 'VS Code', path: 'code', tipo: 'app' as const },
    { nome: 'GitHub', url: 'https://github.com', tipo: 'site' as const },
    { nome: 'Supabase', url: 'https://supabase.com', tipo: 'site' as const },
    { nome: 'Vercel', url: 'https://vercel.com', tipo: 'site' as const }
  ]

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {mensagemNotificacao && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-pulse">
          {mensagemNotificacao}
        </div>
      )}

      <header className="fixed top-0 left-0 right-0 h-16 bg-gray-800 border-b border-gray-700 flex items-center justify-between px-6 z-10">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold">Omni Work Station</h1>
          <div className={`px-3 py-1 rounded-full text-sm font-semibold ${getModoCor()}`}>
            {getModoLabel()}
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => window.electronAPI.setModo('FLEX')}
            className={`px-3 py-1 rounded transition ${estado.modo === 'FLEX' ? 'bg-yellow-500 text-black' : 'bg-gray-700'}`}
          >
            FLEX
          </button>
          <button
            onClick={() => window.electronAPI.setModo('APRENDIZADO')}
            className={`px-3 py-1 rounded transition ${estado.modo === 'APRENDIZADO' ? 'bg-purple-500' : 'bg-gray-700'}`}
          >
            APRENDIZADO
          </button>
        </div>
      </header>

      <main className="pt-20 px-8 pb-8">
        {estado.modo === 'FOCO' && (
          <div className="mb-6 p-4 bg-green-500 bg-opacity-20 border border-green-500 rounded-lg text-center">
            🎯 Modo FOCO ativo. Suas perguntas serão respondidas após o Pomodoro.
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">⏱️ Pomodoro</h2>
            <div className="text-center">
              <div className="text-7xl font-mono font-bold mb-6">
                {formatarTempo(estado.tempoRestante)}
              </div>
              {estado.tarefaAtualTitulo && (
                <div className="mb-4 text-sm text-gray-400">Tarefa: {estado.tarefaAtualTitulo}</div>
              )}
              <div className="flex gap-3 justify-center">
                {!estado.pomodoroAtivo ? (
                  <button
                    onClick={() => iniciarPomodoro()}
                    className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded-lg transition"
                  >
                    ▶ Iniciar
                  </button>
                ) : (
                  <button
                    onClick={pausarPomodoro}
                    className="bg-yellow-600 hover:bg-yellow-700 px-6 py-2 rounded-lg transition"
                  >
                    ⏸ Pausar
                  </button>
                )}
                <button
                  onClick={resetarPomodoro}
                  className="bg-gray-700 hover:bg-gray-600 px-6 py-2 rounded-lg transition"
                >
                  🔄 Reset
                </button>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">📋 Próximas Ações (GTD)</h2>
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={novaTarefa}
                onChange={(e) => setNovaTarefa(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && adicionarTarefa()}
                placeholder="Nova tarefa..."
                className="flex-1 bg-gray-700 border border-gray-600 rounded-lg p-2 text-white placeholder-gray-400"
              />
              <button
                onClick={adicionarTarefa}
                className="bg-blue-600 hover:bg-blue-700 px-4 rounded-lg transition"
              >
                +
              </button>
            </div>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {tarefas.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Nenhuma tarefa pendente</p>
              ) : (
                tarefas.map((tarefa) => (
                  <div
                    key={tarefa.id}
                    className="flex items-center justify-between p-3 bg-gray-700 rounded-lg"
                  >
                    <span className="flex-1">{tarefa.titulo}</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => iniciarPomodoro(tarefa.id, tarefa.titulo)}
                        className="text-green-400 hover:text-green-300 px-2"
                        title="Iniciar Pomodoro com esta tarefa"
                      >
                        ▶
                      </button>
                      <button
                        onClick={() => concluirTarefa(tarefa.id)}
                        className="text-blue-400 hover:text-blue-300 px-2"
                        title="Concluir"
                      >
                        ✅
                      </button>
                      <button
                        onClick={() => removerTarefa(tarefa.id)}
                        className="text-red-400 hover:text-red-300 px-2"
                        title="Remover"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">🚀 Launcher Rápido</h2>
            <div className="grid grid-cols-2 gap-3">
              {APPS_SUGERIDOS.map((item) => (
                <button
                  key={item.nome}
                  onClick={() => {
                    if (item.tipo === 'app') {
                      const path = item.path.replace('%USERNAME%', '')
                      window.electronAPI.abrirApp(path)
                    } else {
                      window.electronAPI.abrirSite(item.url!)
                    }
                  }}
                  className="p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition text-center"
                >
                  {item.nome}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">💬 OmniScript - Converse com a IA</h2>

            <div className="bg-gray-900 rounded-lg p-4 h-64 overflow-y-auto mb-4">
              {mensagensIA.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  🤖 Pergunte algo. Ex: &quot;Como instalar Node.js?&quot; ou &quot;Me ajude com uma tarefa&quot;
                </div>
              ) : (
                mensagensIA.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`mb-3 ${msg.tipo === 'pergunta' ? 'text-right' : 'text-left'}`}
                  >
                    <div
                      className={`inline-block max-w-[75%] p-3 rounded-lg ${msg.tipo === 'pergunta' ? 'bg-blue-600' : 'bg-gray-700'}`}
                    >
                      <p className="text-sm">{msg.texto}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {msg.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
              {iaPensando && (
                <div className="text-left mb-3">
                  <div className="inline-block bg-gray-700 p-3 rounded-lg">
                    <p className="text-sm">🤔 Pensando...</p>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={inputOmniScript}
                onChange={(e) => setInputOmniScript(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && enviarOmniScript()}
                placeholder={
                  estado.modo === 'FOCO'
                    ? '📝 Anotação (será respondida após o FOCO)...'
                    : 'Digite sua pergunta para a IA...'
                }
                className="flex-1 bg-gray-700 border border-gray-600 rounded-lg p-3 text-white placeholder-gray-400"
                disabled={iaPensando}
              />
              <button
                onClick={enviarOmniScript}
                disabled={iaPensando}
                className="bg-blue-600 hover:bg-blue-700 px-6 rounded-lg transition disabled:opacity-50"
              >
                Enviar
              </button>
            </div>

            {modoOllamaOffline && (
              <div className="mt-3 p-3 bg-yellow-900 border border-yellow-700 rounded-lg text-sm">
                ⚠️ Ollama offline. Instale em{' '}
                <a href="https://ollama.com" className="text-blue-400 underline">
                  ollama.com
                </a>{' '}
                e rode:{' '}
                <code className="bg-gray-800 px-2 py-1 rounded">ollama run llama3.2:3b</code>
              </div>
            )}

            {estado.modo === 'FOCO' && (
              <div className="mt-3 text-center text-sm text-gray-400">
                📌 Modo FOCO: Suas perguntas serão respondidas ao final do Pomodoro.
              </div>
            )}
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 flex justify-between items-center">
              <span>🔧 Ambiente</span>
              <button
                onClick={carregarInventario}
                disabled={carregandoInventario || estado.modo === 'FOCO'}
                className="text-sm bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded transition disabled:opacity-50"
              >
                🔄 Atualizar
              </button>
            </h2>

            {estado.modo === 'FOCO' ? (
              <div className="text-center py-8 text-gray-400 text-sm">
                Inventário pausado durante FOCO (R3).
              </div>
            ) : carregandoInventario ? (
              <div className="text-center py-8 text-gray-400">Carregando inventário...</div>
            ) : inventario ? (
              <div className="space-y-4">
                <div className="flex gap-4 text-sm">
                  <span className="text-green-400">✅ Instaladas: {inventario.totalInstalados}</span>
                  <span className="text-red-400">⚠️ Ausentes: {inventario.totalAusentes}</span>
                </div>

                {inventario.ausentes.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold mb-2 text-yellow-400">
                      Ferramentas ausentes (contexto Dev)
                    </h3>
                    <div className="space-y-2">
                      {inventario.ausentes.map((app, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2 bg-gray-700 rounded"
                        >
                          <span>{app.nome}</span>
                          <button
                            onClick={() =>
                              window.electronAPI
                                .ambienteInstalar(app.id, app.nome)
                                .then((res) => {
                                  setMensagemNotificacao(
                                    res.mensagem || `Comando: ${res.comando}`
                                  )
                                  setTimeout(() => setMensagemNotificacao(''), 5000)
                                })
                            }
                            className="text-blue-400 hover:text-blue-300 text-sm px-2 py-1"
                          >
                            📦 Instalar
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {inventario.instalados.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold mb-2 text-green-400">Instaladas</h3>
                    <div className="max-h-40 overflow-y-auto space-y-1">
                      {inventario.instalados.slice(0, 15).map((app, idx) => (
                        <div key={idx} className="text-xs text-gray-400">
                          {app.nome} - {app.versao}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                ⚠️ Não foi possível carregar o inventário. Verifique se o winget está disponível.
                <button
                  onClick={carregarInventario}
                  className="block mx-auto mt-4 bg-blue-600 px-4 py-2 rounded hover:bg-blue-700"
                >
                  Tentar novamente
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
