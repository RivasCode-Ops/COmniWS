import { exec } from 'child_process'
import { promisify } from 'util'
import { logger } from './logger'

const execPromise = promisify(exec)

const WINGET_TIMEOUT_MS = 120000

export function appIdPermitido(appId: string, whitelist: string[]): boolean {
  if (!appId) return false
  return whitelist.some((id) => id.toLowerCase() === appId.toLowerCase())
}

export async function executarInstalacaoWinget(
  appId: string,
  whitelist: string[]
): Promise<{ sucesso: boolean; stdout?: string; stderr?: string; motivo?: string }> {
  if (!appIdPermitido(appId, whitelist)) {
    return {
      sucesso: false,
      motivo: `Pacote ${appId} fora da whitelist (política P1/P2).`
    }
  }

  const comando = `winget install --id ${appId} --accept-package-agreements --accept-source-agreements --silent`

  try {
    logger.info(`Executor: ${comando}`)
    const { stdout, stderr } = await execPromise(comando, {
      timeout: WINGET_TIMEOUT_MS,
      maxBuffer: 10 * 1024 * 1024
    })
    return { sucesso: true, stdout, stderr }
  } catch (error: unknown) {
    const err = error as { stdout?: string; stderr?: string; message?: string }
    logger.error('Executor winget falhou:', err.message || error)
    return {
      sucesso: false,
      stdout: err.stdout,
      stderr: err.stderr || err.message,
      motivo: 'Falha ao executar winget install'
    }
  }
}
