import jwt from 'jsonwebtoken'

/**
 * Token Blacklist Service
 * Manages revoked JWT tokens to prevent their usage after logout
 */
export class TokenBlacklistService {
  private static instance: TokenBlacklistService
  private blacklistedTokens: Set<string> = new Set()
  private tokenExpiryMap: Map<string, number> = new Map()

  private constructor() {
    // Cleanup expired tokens every hour
    setInterval(
      () => {
        this.cleanupExpiredTokens()
      },
      60 * 60 * 1000
    ) // 1 hour
  }

  public static getInstance(): TokenBlacklistService {
    if (!TokenBlacklistService.instance) {
      TokenBlacklistService.instance = new TokenBlacklistService()
    }
    return TokenBlacklistService.instance
  }

  /**
   * Add a token to the blacklist
   * @param token - JWT token to blacklist
   */
  public blacklistToken(token: string): void {
    try {
      // Decode token to get expiry time
      const decoded = jwt.decode(token) as any

      if (decoded && decoded.exp) {
        const expiryTime = decoded.exp * 1000 // Convert to milliseconds

        // Only blacklist if token hasn't expired yet
        if (expiryTime > Date.now()) {
          this.blacklistedTokens.add(token)
          this.tokenExpiryMap.set(token, expiryTime)

          console.log(
            `Token blacklisted. Total blacklisted tokens: ${this.blacklistedTokens.size}`
          )
        }
      }
    } catch (error) {
      console.error('Error blacklisting token:', error)
      // Blacklist anyway as a safety measure
      this.blacklistedTokens.add(token)
    }
  }

  /**
   * Check if a token is blacklisted
   * @param token - JWT token to check
   * @returns boolean - true if token is blacklisted
   */
  public isTokenBlacklisted(token: string): boolean {
    return this.blacklistedTokens.has(token)
  }

  /**
   * Get blacklist statistics
   * @returns object with blacklist stats
   */
  public getBlacklistStats(): { totalBlacklisted: number; activeBlacklisted: number } {
    const now = Date.now()
    let activeCount = 0

    for (const [, expiryTime] of this.tokenExpiryMap) {
      if (expiryTime > now) {
        activeCount++
      }
    }

    return {
      totalBlacklisted: this.blacklistedTokens.size,
      activeBlacklisted: activeCount,
    }
  }

  /**
   * Clean up expired tokens from blacklist
   * This prevents memory leaks by removing old tokens
   */
  private cleanupExpiredTokens(): void {
    const now = Date.now()
    const tokensToRemove: string[] = []

    for (const [token, expiryTime] of this.tokenExpiryMap) {
      if (expiryTime <= now) {
        tokensToRemove.push(token)
      }
    }

    tokensToRemove.forEach((token) => {
      this.blacklistedTokens.delete(token)
      this.tokenExpiryMap.delete(token)
    })

    if (tokensToRemove.length > 0) {
      console.log(`Cleaned up ${tokensToRemove.length} expired tokens from blacklist`)
    }
  }

  /**
   * Clear all blacklisted tokens (for testing/admin purposes)
   */
  public clearBlacklist(): void {
    this.blacklistedTokens.clear()
    this.tokenExpiryMap.clear()
    console.log('Token blacklist cleared')
  }
}

export default TokenBlacklistService.getInstance()
