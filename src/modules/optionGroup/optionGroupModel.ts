import mongoose from 'mongoose'
import { FieldsConfig } from '../../common/interfaces/fieldTypes'
import { BaseModel } from '../../common/core/baseModel'
import { OptionGroup } from './optionGroupInterface'
import { createMongooseSchema } from '../../common/utils/schemaUtils'

const fields: FieldsConfig = {
  slug: {
    type: 'string',
    nullable: false,
    unique: true,
  },
  display_label: {
    type: 'string',
    nullable: false,
  },
  render_type: {
    type: 'string',
    nullable: false,
  },
  yes_no_required: {
    type: 'boolean',
    nullable: true,
  },
  na_allowed: {
    type: 'boolean',
    nullable: true,
  },
  applies_to_drives: {
    type: 'array',
    itemType: 'string',
    nullable: true,
  },
  sort_order: {
    type: 'number',
    nullable: true,
  },
  option_type_filter: {
    type: 'string',
    nullable: true,
  },
  option_slug_filter: {
    type: 'string',
    nullable: true,
  },
  sub_fields: {
    type: 'json',
    nullable: true,
  },
  is_active: {
    type: 'boolean',
    nullable: true,
  },
}

export class OptionGroupModel extends BaseModel<OptionGroup> {
  private static instance: OptionGroupModel;
  constructor() {
    const schema = createMongooseSchema(fields, {
      includeSoftDelete: true,
      includeTimestamps: true
    })
    super('OptionGroup', fields, schema)
  }

  public static getInstance(): OptionGroupModel {
    if (!OptionGroupModel.instance) {
      OptionGroupModel.instance = new OptionGroupModel();
    }
    return OptionGroupModel.instance;
  }
}
