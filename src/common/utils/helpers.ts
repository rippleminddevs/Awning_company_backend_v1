import { Request, Response, NextFunction } from 'express'
import { ObjectSchema } from 'joi'
import { PaginationMeta, PaginationOptions, PaginationParams } from '../interfaces/globalInterfaces'

export const validate = (schema: ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body, { abortEarly: false })

    if (error) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        error: {
          code: 'BAD_REQUEST',
          message: error.details[0]?.message || 'Something went wrong',
        },
      })
    }
    next()
  }
}

export const validateParams = (schema: ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.params, { abortEarly: false })

    if (error) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        error: {
          code: 'BAD_REQUEST',
          message: error.details[0]?.message || 'Something went wrong',
        },
      })
    }
    next()
  }
}

export const validateQuery = (schema: ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.query, { abortEarly: false })

    if (error) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        error: {
          code: 'BAD_REQUEST',
          message: error.details[0]?.message || 'Something went wrong',
        },
      })
    }
    next()
  }
}

export const getPaginationParams = (options: PaginationOptions): PaginationParams => {
  const page = parseInt(String(options.page)) || 1
  const perPage = parseInt(String(options.perPage)) || 10
  const skip = (page - 1) * perPage
  return { skip, limit: perPage }
}

export const buildPaginationMeta = (
  totalCount: number,
  page: number,
  perPage: number
): PaginationMeta => {
  const totalPages = Math.ceil(totalCount / perPage)
  return {
    page: parseInt(String(page)) || 1,
    perPage: parseInt(String(perPage)) || 10,
    totalCount,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  }
}
