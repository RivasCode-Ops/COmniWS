import { join } from 'path'
import { app } from 'electron'
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs'

export const WHITELIST_PADRAO = [
  'Git.Git',
  'OpenJS.NodeJS',
  'Microsoft.VisualStudioCode',
  'Cursor.Cursor',
  'Docker.DockerDesktop',
  'Supabase.Supabase',
  'Ollama.Ollama'
]

export type NivelPolitica = 'P0' | 'P1' | 'P2' | 'P3'

export interface PoliticasConfig {
  whitelist: string[]
  nivelInstalacao: 'P1' | 'P2'
}

function caminhoPoliticas() {
  const dir = join(app.getPath('userData'), 'config')
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
  return join(dir, 'politicas.json')
}

export function carregarPoliticas(): PoliticasConfig {
  const path = caminhoPoliticas()
  if (!existsSync(path)) {
    const padrao: PoliticasConfig = { whitelist: [...WHITELIST_PADRAO], nivelInstalacao: 'P2' }
    writeFileSync(path, JSON.stringify(padrao, null, 2), 'utf-8')
    return padrao
  }
  try {
    const raw = JSON.parse(readFileSync(path, 'utf-8')) as PoliticasConfig
    return {
      whitelist: raw.whitelist?.length ? raw.whitelist : [...WHITELIST_PADRAO],
      nivelInstalacao: raw.nivelInstalacao || 'P2'
    }
  } catch {
    return { whitelist: [...WHITELIST_PADRAO], nivelInstalacao: 'P2' }
  }
}

export function salvarPoliticas(config: PoliticasConfig) {
  writeFileSync(caminhoPoliticas(), JSON.stringify(config, null, 2), 'utf-8')
}
