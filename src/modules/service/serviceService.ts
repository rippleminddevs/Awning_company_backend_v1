import { BaseService } from '../../common/core/baseService'
import { ServiceModel } from './serviceModel'
import { Service, ServiceResponse } from './serviceInterface'

export class ServiceService extends BaseService<Service> {
  constructor() {
    super(ServiceModel.getInstance())
  }

  // Override to control populated fields and sort order
  public getAll = async (params: any = {}) => {
    return this.model.getAll({
      ...params,
      sort: { order: 1 }, // Sort by order field ascending
      populate: {
        path: 'createdBy',
        select: '_id name role'
      }
    })
  }
}