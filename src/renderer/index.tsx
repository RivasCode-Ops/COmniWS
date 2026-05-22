import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { TelaAuxiliar } from './components/TelaAuxiliar'
import './styles/tailwind.css'

const temaSalvo = localStorage.getItem('tema') || 'dark'
document.documentElement.classList.toggle('dark', temaSalvo === 'dark')

const params = new URLSearchParams(window.location.search)
const isAuxiliar = params.get('view') === 'auxiliar'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {isAuxiliar ? <TelaAuxiliar /> : <App />}
  </React.StrictMode>
)
