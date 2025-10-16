import { Request, Response } from 'express'
import { BaseController } from '../../common/core/baseController'
import { UploadService } from './uploadService'
import { Upload } from './uploadInterface'
import { AppError } from '../../common/utils/appError'
import { apiResponse } from '../../common/utils/apiResponse'

export class UploadController extends BaseController<Upload, UploadService> {
  constructor(uploadService: UploadService) {
    super(uploadService)
  }

  public create = async (req: Request, res: Response): Promise<void> => {
    const body = req.body
    if (!req.file) {
      throw AppError.badRequest('File is required')
    }

    body.userId = req.user!.id
    body.file = req.file
    const data = await this.service.create(body)
    return apiResponse(res, data, 201)
  }
}
