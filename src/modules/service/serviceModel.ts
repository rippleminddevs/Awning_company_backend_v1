import mongoose from 'mongoose'
import { FieldsConfig } from '../../common/interfaces/fieldTypes'
import { BaseModel } from '../../common/core/baseModel'
import { Service } from './serviceInterface'
import { createMongooseSchema } from '../../common/utils/schemaUtils'

const fields: FieldsConfig = {
  name: {
    type: 'string',
    nullable: false,
  },
  createdBy: {
    type: 'string',
    mongooseType: 'ObjectId',
    ref: 'User',
    nullable: false,
  },
}

export class ServiceModel extends BaseModel<Service> {
  private static instance: ServiceModel;
  constructor() {
    const schema = createMongooseSchema(fields,{
      includeTimestamps: true,
    })
    super('Service', fields, schema)
  }

  public static getInstance(): ServiceModel {
    if (!ServiceModel.instance) {
      ServiceModel.instance = new ServiceModel();
    }
    return ServiceModel.instance;
  }
}
