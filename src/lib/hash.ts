import crypto from 'crypto'

/** Gera "salt:hash" (scrypt) para uma senha. */
export function hashPassword(pw: string): string {
  const salt = crypto.randomBytes(16)
  const hash = crypto.scryptSync(pw, salt, 64)
  return `${salt.toString('hex')}:${hash.toString('hex')}`
}

/** Verifica uma senha contra o "salt:hash" armazenado (comparação constante). */
export function verifyPassword(pw: string, stored: string): boolean {
  const [saltHex, hashHex] = (stored || '').split(':')
  if (!saltHex || !hashHex) return false
  try {
    const salt = Buffer.from(saltHex, 'hex')
    const expected = Buffer.from(hashHex, 'hex')
    const actual = crypto.scryptSync(pw, salt, expected.length)
    return expected.length === actual.length && crypto.timingSafeEqual(actual, expected)
  } catch {
    return false
  }
}
