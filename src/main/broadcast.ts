import type { BrowserWindow } from 'electron'

const janelas = new Set<BrowserWindow>()

export function registrarJanela(win: BrowserWindow) {
  janelas.add(win)
  win.on('closed', () => janelas.delete(win))
}

export function broadcast(channel: string, payload?: unknown) {
  for (const win of janelas) {
    if (!win.isDestroyed()) {
      win.webContents.send(channel, payload)
    }
  }
}

export function quantidadeJanelas(): number {
  return [...janelas].filter((w) => !w.isDestroyed()).length
}
