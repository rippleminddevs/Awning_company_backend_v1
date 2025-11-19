import * as crypto from 'crypto'

const ALGORITHM = 'aes-256-cbc'
const IV_LENGTH = 16

class EncryptionService {
  private secretKey: Buffer

  constructor() {
    const key = process.env.ENCRYPTION_KEY || ''

    // Convert hex string to buffer, pad or truncate to 32 bytes
    let keyBuffer = Buffer.from(key, 'hex')
    if (keyBuffer.length < 32) {
      // Pad with zeros if too short
      keyBuffer = Buffer.concat([keyBuffer, Buffer.alloc(32 - keyBuffer.length, 0)])
    } else if (keyBuffer.length > 32) {
      // Truncate if too long
      keyBuffer = keyBuffer.slice(0, 32)
    }

    this.secretKey = keyBuffer
  }

  /**
   * Encrypts a string using AES-256-CBC
   * @param text The text to encrypt
   * @returns Encrypted string in format iv:encryptedText
   */
  public encrypt(text: string): string {
    if (!text) return text

    const iv = crypto.randomBytes(IV_LENGTH)
    const cipher = crypto.createCipheriv(ALGORITHM, this.secretKey, iv)

    let encrypted = cipher.update(text, 'utf8', 'hex')
    encrypted += cipher.final('hex')
    return `${iv.toString('hex')}:${encrypted}`
  }

  /**
   * Decrypts a string that was encrypted using the encrypt method
   * @param text The encrypted text in format iv:encryptedText
   * @returns Decrypted string or original text if decryption fails
   */
  public decrypt(text: string): string {
    if (!text) return text

    try {
      const [ivString, encryptedText] = text.split(':')
      if (!ivString || !encryptedText) {
        throw new Error('Invalid encrypted text format')
      }

      const iv = Buffer.from(ivString, 'hex')
      const encrypted = Buffer.from(encryptedText, 'hex')
      const decipher = crypto.createDecipheriv(ALGORITHM, this.secretKey, iv)

      let decrypted = decipher.update(encrypted)
      decrypted = Buffer.concat([decrypted, decipher.final()])
      return decrypted.toString('utf8')
    } catch (e) {
      console.warn('Failed to decrypt text, returning as is')
      return text
    }
  }

  /**
   * Encrypts sensitive fields in an object
   * @param data The object containing sensitive data
   * @param fields Object mapping field paths to encryption status
   * @returns New object with encrypted fields
   */
  public encryptFields<T>(
    data: T,
    fields: Record<string, readonly string[]> | Record<string, string[]>
  ): T {
    if (!data) return data

    const result = { ...data } as any

    for (const [parentKey, fieldNames] of Object.entries(fields)) {
      if (!result[parentKey]) continue

      result[parentKey] = { ...result[parentKey] }

      for (const fieldName of fieldNames) {
        if (result[parentKey][fieldName] != null) {
          result[parentKey][fieldName] = this.encrypt(String(result[parentKey][fieldName]))
        }
      }
    }

    return result as T
  }

  /**
   * Decrypts sensitive fields in an object
   * @param data The object containing encrypted data
   * @param fields Object mapping field paths to decryption status
   * @returns New object with decrypted fields
   */
  public decryptFields<T>(
    data: T,
    fields: Record<string, readonly string[]> | Record<string, string[]>
  ): T {
    if (!data) return data

    const result = { ...data } as any

    for (const [parentKey, fieldNames] of Object.entries(fields)) {
      if (!result[parentKey]) continue

      result[parentKey] = { ...result[parentKey] }

      for (const fieldName of fieldNames) {
        if (result[parentKey][fieldName] != null) {
          result[parentKey][fieldName] = this.decrypt(String(result[parentKey][fieldName]))
        }
      }
    }

    return result as T
  }
}

export const encryptionService = new EncryptionService()
