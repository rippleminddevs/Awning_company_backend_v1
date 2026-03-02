import { BaseService } from '../../common/core/baseService'
import { FabricModel } from './fabricModel'
import { Fabric } from './fabricInterface'

export class FabricService extends BaseService<Fabric> {
  constructor() {
    super(FabricModel.getInstance())
  }
}