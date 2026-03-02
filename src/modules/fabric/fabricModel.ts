import mongoose from 'mongoose'
import { FieldsConfig } from '../../common/interfaces/fieldTypes'
import { BaseModel } from '../../common/core/baseModel'
import { Fabric } from './fabricInterface'

const fields: FieldsConfig = {
  fabric_number: {
    type: 'string',
    nullable: false,
  },
  fabric_name: {
    type: 'string',
    nullable: true,
  },
  fabric_type: {
    type: 'string',
    nullable: true,
  },
  brand: {
    type: 'string',
    nullable: true,
  },
  supplier: {
    type: 'string',
    nullable: true,
  },
  is_active: {
    type: 'boolean',
    nullable: true,
  },
}

export class FabricModel extends BaseModel<Fabric> {
  private static instance: FabricModel;
  constructor() {
    super('Fabric', fields)
  }

  public static getInstance(): FabricModel {
    if (!FabricModel.instance) {
      FabricModel.instance = new FabricModel();
    }
    return FabricModel.instance;
  }
}
