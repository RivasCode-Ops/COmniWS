import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { TelaAuxiliar } from './components/TelaAuxiliar'
import './styles/tailwind.css'

document.documentElement.classList.add('dark')

const params = new URLSearchParams(window.location.search)
const isAuxiliar = params.get('view') === 'auxiliar'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {isAuxiliar ? <TelaAuxiliar /> : <App />}
  </React.StrictMode>
)
