import { FieldsConfig } from '../../common/interfaces/fieldTypes'
import { BaseModel } from '../../common/core/baseModel'
import { Integration } from './integrationInterface'
import { createMongooseSchema } from '../../common/utils/schemaUtils'

const fields: FieldsConfig = {
  smtp: {
    type: 'object',
    mongooseType: 'Mixed',
    nullable: true,
  },
  mailChimp: {
    type: 'object',
    mongooseType: 'Mixed',
    nullable: true,
  },
  thirdPartyTool: {
    type: 'array',
    itemType: 'Mixed',
    nullable: true,
  },
  notificationSetting: {
    type: 'object',
    mongooseType: 'Mixed',
    nullable: true,
  },
  createdBy: {
    type: 'string',
    mongooseType: 'ObjectId',
    ref: 'User',
    nullable: false,
  },
}

export class IntegrationModel extends BaseModel<Integration> {
  private static instance: IntegrationModel
  constructor() {
    const schema = createMongooseSchema(fields, {
      includeTimestamps: true,
    })
    super('Integration', fields, schema)
  }

  public static getInstance(): IntegrationModel {
    if (!IntegrationModel.instance) {
      IntegrationModel.instance = new IntegrationModel()
    }
    return IntegrationModel.instance
  }
}
