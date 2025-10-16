import { Request, Response } from 'express'
import { AppError } from '../utils/appError'
import { apiError, apiResponse } from '../utils/apiResponse'
import { BaseService } from './baseService'

export class BaseController<T, S extends BaseService<T>> {
  protected service: S // Store the service as a property

  constructor(service: S) {
    this.service = service
  }

  protected handleResponse = (res: Response, data: any, statusCode: number = 200): void => {
    apiResponse(res, data, statusCode)
  }

  protected handleError = (res: Response, error: AppError | Error): void => {
    apiError(res, error)
  }

  public getAll = async (req: Request, res: Response): Promise<void> => {
    try {
      const { query } = req
      const data = await this.service.getAll(query)
      this.handleResponse(res, data)
    } catch (error: any) {
      console.log('error', error)
      this.handleError(res, error)
    }
  }

  public getById = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = req.params.id
      if (!id) {
        throw AppError.badRequest('ID is required')
      }

      const data = await this.service.getById(id)
      this.handleResponse(res, data)
    } catch (error: any) {
      this.handleError(res, error)
    }
  }

  public create = async (req: Request, res: Response): Promise<void> => {
    try {
      const body = req.body
      const data = await this.service.create(body)
      this.handleResponse(res, data, 201)
    } catch (error: any) {
      this.handleError(res, error)
    }
  }

  public update = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = req.params.id
      const body = req.body

      if (!id) {
        throw AppError.badRequest('ID is required')
      }

      const data = await this.service.update(id, body)
      this.handleResponse(res, data)
    } catch (error: any) {
      this.handleError(res, error)
    }
  }

  public delete = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = req.params.id
      if (!id) {
        throw AppError.badRequest('ID is required')
      }

      const deletedData: any = await this.service.delete(id)
      this.handleResponse(res, {
        message: deletedData?.message || 'Resource deleted successfully',
      })
    } catch (error: any) {
      this.handleError(res, error)
    }
  }
}
