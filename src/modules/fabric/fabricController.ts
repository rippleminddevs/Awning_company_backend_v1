import { BaseController } from '../../common/core/baseController'
import { FabricService } from './fabricService'
import { Fabric } from './fabricInterface'

export class FabricController extends BaseController<Fabric, FabricService> {
  constructor(fabricService: FabricService) {
    super(fabricService)
  }
}
