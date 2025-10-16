import { BaseController } from '../../common/core/baseController'
import { ServiceService } from './serviceService'
import { Service } from './serviceInterface'
import { Request, Response } from 'express'
import { apiResponse } from '../../common/utils/apiResponse'

export class ServiceController extends BaseController<Service, ServiceService> {
  constructor(serviceService: ServiceService) {
    super(serviceService)
  }

  public create = async (req: Request, res: Response): Promise<void> => {
    const service: Service = {
      ...req.body,
      createdBy: req.user!.id,
    }
    const createdService: Service = await this.service.create(service)
    apiResponse(res, createdService, 201, "Service created successfully")
  }

  public update = async (req: Request, res: Response): Promise<void> => {
    const service: Service = {
      ...req.body,
      createdBy: req.user!.id,
    }
    const updatedService: Service = await this.service.update(req.params.id, service)
    apiResponse(res, updatedService, 200, "Service updated successfully")
  }

  public delete = async (req: Request, res: Response): Promise<void> => {
    const deletedService: Service = await this.service.delete(req.params.id)
    apiResponse(res, deletedService, 200, "Service deleted successfully")
  }
}
