import log from 'electron-log'
import { app } from 'electron'
import { join } from 'path'
import { mkdirSync } from 'fs'

let initialized = false

export function setupLogger() {
  if (initialized) return log

  const logsDir = join(app.getPath('userData'), 'logs')
  mkdirSync(logsDir, { recursive: true })

  log.transports.file.level = 'info'
  log.transports.file.maxSize = 10 * 1024 * 1024
  log.transports.file.format = '{h}:{i}:{s} {text}'
  log.transports.file.resolvePathFn = () => join(logsDir, 'omniws.log')

  initialized = true
  return log
}

export const logger = log
