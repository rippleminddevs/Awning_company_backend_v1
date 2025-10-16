// src/utils/AppError.ts
export class AppError extends Error {
  public readonly statusCode: number
  public readonly code: string
  public readonly isOperational: boolean

  constructor(
    message: string,
    statusCode: number,
    code: string = 'INTERNAL_SERVER_ERROR',
    isOperational: boolean = true
  ) {
    super(message)
    this.statusCode = statusCode
    this.code = code
    this.isOperational = isOperational
    Error.captureStackTrace(this, this.constructor)
    Object.setPrototypeOf(this, AppError.prototype)
  }

  static notFound(message: string = 'Resource not found'): AppError {
    return new AppError(message, 404, 'NOT_FOUND')
  }

  static badRequest(message: string = 'Bad request'): AppError {
    return new AppError(message, 400, 'BAD_REQUEST')
  }

  static unauthorized(message: string = 'Unauthorized'): AppError {
    return new AppError(message, 401, 'UNAUTHORIZED')
  }

  static forbidden(message: string = 'Forbidden'): AppError {
    return new AppError(message, 403, 'FORBIDDEN');
  }
}
