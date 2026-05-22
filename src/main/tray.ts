import { Tray, Menu, app, BrowserWindow, nativeImage } from 'electron'
import { join } from 'path'
import { existsSync } from 'fs'

let tray: Tray | null = null

function obterIconeTray() {
  const candidatos = [
    join(process.cwd(), 'resources/icon.png'),
    join(process.cwd(), 'resources/icon.ico'),
    join(__dirname, '../../resources/icon.png'),
    join(__dirname, '../../resources/icon.ico')
  ]

  for (const caminho of candidatos) {
    if (existsSync(caminho)) {
      return nativeImage.createFromPath(caminho)
    }
  }

  return nativeImage.createFromDataURL(
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAANklEQVQ4T2NkYGD4z0ABYBwG1jBK1QGoQhrUBqhCGtQGqEIa1AaoQhrUBgB5Xh1J8Xy0WAAAAABJRU5ErkJggg=='
  )
}

export interface TrayCallbacks {
  mostrarJanela: () => void
  modoFoco: () => void
  modoFlex: () => void
}

export function criarTray(mainWindow: BrowserWindow, callbacks: TrayCallbacks) {
  if (tray) return

  tray = new Tray(obterIconeTray())

  const contextMenu = Menu.buildFromTemplate([
    { label: 'Mostrar Omni Work', click: () => callbacks.mostrarJanela() },
    { label: 'Modo FOCO', click: () => callbacks.modoFoco() },
    { label: 'Modo FLEX', click: () => callbacks.modoFlex() },
    { type: 'separator' },
    { label: 'Sair', click: () => app.quit() }
  ])

  tray.setToolTip('Omni Work Station')
  tray.setContextMenu(contextMenu)

  tray.on('click', () => {
    if (mainWindow.isVisible()) {
      mainWindow.hide()
    } else {
      callbacks.mostrarJanela()
    }
  })
}

export function destruirTray() {
  if (tray) {
    tray.destroy()
    tray = null
  }
}
