import { Request, Response, NextFunction } from 'express'
import { apiError } from './apiResponse'

class ErrorHandler {
  public handle(err: Error, _req: Request, res: Response, _next: NextFunction): void {
    apiError(res, err)
  }
}

export { ErrorHandler }
