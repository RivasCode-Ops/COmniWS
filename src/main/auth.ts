import crypto from 'crypto'

export function hashPin(pin: string): string {
  return crypto.createHash('sha256').update(pin.trim()).digest('hex')
}

export function validarPin(pin: string, hash: string): boolean {
  return hashPin(pin) === hash
}
