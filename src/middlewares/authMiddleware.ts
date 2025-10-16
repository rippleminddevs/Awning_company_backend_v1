import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { AppError } from '../common/utils/appError'
import { config } from '../services/configService'

export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  const token = req.header('Authorization')?.replace('Bearer ', '')

  if (!token) {
    throw AppError.unauthorized('Access denied. No token provided.')
  }

  try {
    const decoded = jwt.verify(token, config.jwt.secret) as { id: string; email: string }
    req.user = decoded
    next()
  } catch (error) {
    throw AppError.unauthorized('Invalid token')
  }
}
