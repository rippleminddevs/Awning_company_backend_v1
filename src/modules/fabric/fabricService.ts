import { BaseService } from '../../common/core/baseService'
import { FabricModel } from './fabricModel'
import { Fabric } from './fabricInterface'

export class FabricService extends BaseService<Fabric> {
  constructor() {
    super(FabricModel.getInstance())
  }

  public getAll = async (params: any = {}): Promise<Fabric[]> => {
    return this.model.getAll({
      ...params,
      ...(params?.fabric_number && {
          fabric_number: new RegExp(params.fabric_number, 'i'),
      }),
    })
  }
}