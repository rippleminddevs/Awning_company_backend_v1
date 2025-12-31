import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { AppError } from '../common/utils/appError'
import { config } from '../services/configService'
import TokenBlacklistService from '../services/tokenBlacklistService'

export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  const token = req.header('Authorization')?.replace('Bearer ', '')

  if (!token) {
    throw AppError.unauthorized('Access denied. No token provided.')
  }

  try {
    // Check if token is blacklisted
    if (TokenBlacklistService.isTokenBlacklisted(token)) {
      throw AppError.unauthorized('Token has been revoked')
    }

    const decoded = jwt.verify(token, config.jwt.secret) as { id: string; email: string }
    req.user = decoded
    next()
  } catch (error) {
    if (error instanceof AppError) {
      throw error
    }

    // Handle JWT specific errors
    if (error instanceof jwt.TokenExpiredError) {
      throw AppError.unauthorized('Token expired')
    }

    if (error instanceof jwt.JsonWebTokenError) {
      throw AppError.unauthorized('Invalid token')
    }

    throw AppError.unauthorized('Authentication failed')
  }
}
