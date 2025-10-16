// src/utils/apiResponse.ts
import { Response } from 'express'
import { AppError } from './appError'

export const apiResponse = (res: Response, data: any, statusCode: number = 200, message?: string): void => {
  const response: any = {
    success: true,
    statusCode,
    data
  };

  if (message) {
    response.message = message;
  }

  res.status(statusCode).json(response);
}

export const apiError = (res: Response, error: AppError | Error): void => {
  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      success: false,
      statusCode: error.statusCode,
      error: {
        code: error.code,
        message: error.message,
      },
    })
  } else {
    // Handle unexpected errors
    res.status(500).json({
      success: false,
      statusCode: 500,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: error.message || 'Something went wrong',
      },
    })
  }
}
