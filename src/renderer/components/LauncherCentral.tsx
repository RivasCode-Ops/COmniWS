import React, { useState, useEffect } from 'react'

interface LauncherItem {
  nome: string
  path?: string
  url?: string
  tipo: 'app' | 'site'
}

interface LauncherCentralProps {
  usuarioNome: string
  workspaceNome: string
  onEntrarEstacao: () => void
  onLogout: () => void
}

export function LauncherCentral({
  usuarioNome,
  workspaceNome,
  onEntrarEstacao,
  onLogout
}: LauncherCentralProps) {
  const [apps, setApps] = useState<LauncherItem[]>([])

  useEffect(() => {
    window.electronAPI.launcherApps().then((lista) => setApps(lista as LauncherItem[]))
  }, [])

  const abrir = (item: LauncherItem) => {
    if (item.tipo === 'app' && item.path) {
      const path = item.path.replace('%USERNAME%', '')
      window.electronAPI.abrirApp(path)
    } else if (item.url) {
      window.electronAPI.abrirSite(item.url)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <header className="h-16 border-b border-gray-700 flex items-center justify-between px-8">
        <div>
          <h1 className="text-xl font-bold">Launcher — {workspaceNome}</h1>
          <p className="text-sm text-gray-400">Olá, {usuarioNome}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onEntrarEstacao}
            className="bg-green-600 hover:bg-green-700 px-5 py-2 rounded-lg font-semibold"
          >
            Entrar na estação →
          </button>
          <button onClick={onLogout} className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg">
            Sair
          </button>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-12">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-4xl w-full">
          {apps.map((item) => (
            <button
              key={item.nome}
              onClick={() => abrir(item)}
              className="p-8 bg-gray-800 hover:bg-gray-700 rounded-2xl border border-gray-600 transition text-center"
            >
              <div className="text-4xl mb-3">{item.tipo === 'site' ? '🌐' : '⚡'}</div>
              <div className="font-semibold">{item.nome}</div>
            </button>
          ))}
        </div>
      </main>

      <footer className="text-center text-gray-500 text-sm py-4">
        Escolha um atalho ou entre na estação para GTD, Pomodoro e propostas.
      </footer>
    </div>
  )
}
