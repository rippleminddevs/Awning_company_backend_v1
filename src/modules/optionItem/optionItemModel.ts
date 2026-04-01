import { FieldsConfig } from '../../common/interfaces/fieldTypes'
import { BaseModel } from '../../common/core/baseModel'
import { OptionItem } from './optionItemInterface'
import { createMongooseSchema } from '../../common/utils/schemaUtils'

const fields: FieldsConfig = {
  group_id: {
    type: 'string',
    mongooseType: 'ObjectId',
    ref: 'OptionGroup',
    nullable: false,
  },
  label: {
    type: 'string',
    nullable: false,
  },
  value: {
    type: 'string',
    nullable: false,
  },
  price_modifier: {
    type: 'number',
    nullable: true,
  },
  is_active: {
    type: 'boolean',
    nullable: true,
  },
}

export class OptionItemModel extends BaseModel<OptionItem> {
  private static instance: OptionItemModel

  constructor() {
    const schema = createMongooseSchema(fields, {
      includeSoftDelete: true,
      includeTimestamps: true,
    })
    schema.index({ group_id: 1 })
    schema.index({ group_id: 1, value: 1 }, { unique: true })
    super('OptionItem', fields, schema)
  }

  public static getInstance(): OptionItemModel {
    if (!OptionItemModel.instance) {
      OptionItemModel.instance = new OptionItemModel()
    }
    return OptionItemModel.instance
  }
}
