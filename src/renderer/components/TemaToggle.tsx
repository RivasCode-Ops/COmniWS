import React, { useState, useEffect } from 'react'

export function TemaToggle() {
  const [tema, setTema] = useState<'dark' | 'light'>('dark')

  useEffect(() => {
    const saved = (localStorage.getItem('tema') as 'dark' | 'light') || 'dark'
    setTema(saved)
    document.documentElement.classList.toggle('dark', saved === 'dark')
  }, [])

  const alternarTema = () => {
    const novoTema = tema === 'dark' ? 'light' : 'dark'
    setTema(novoTema)
    localStorage.setItem('tema', novoTema)
    document.documentElement.classList.toggle('dark', novoTema === 'dark')
  }

  return (
    <button
      onClick={alternarTema}
      className="p-2 rounded-lg bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 transition"
      title={tema === 'dark' ? 'Modo claro' : 'Modo escuro'}
    >
      {tema === 'dark' ? '☀️' : '🌙'}
    </button>
  )
}
