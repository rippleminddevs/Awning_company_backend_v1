import { BaseService } from '../../common/core/baseService'
import { ServiceModel } from './serviceModel'
import { Service } from './serviceInterface'

export class ServiceService extends BaseService<Service> {
  constructor() {
    super(ServiceModel.getInstance())
  }
}