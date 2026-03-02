import mongoose from 'mongoose'
import { FieldsConfig } from '../../common/interfaces/fieldTypes'
import { BaseModel } from '../../common/core/baseModel'
import { OptionCatalog } from './optionCatalogInterface'
import { createMongooseSchema } from '../../common/utils/schemaUtils'

const fields: FieldsConfig = {
  slug: {
    type: 'string',
    nullable: false,
  },
  option_type: {
    type: 'string',
    nullable: false,
  },
  display_name: {
    type: 'string',
    nullable: false,
  },
  unit_price: {
    type: 'number',
    nullable: false,
  },
  price_unit: {
    type: 'string',
    nullable: false,
  },
  is_active: {
    type: 'boolean',
    nullable: false,
  },
  qty_based: {
    type: 'boolean',
    nullable: false,
  },
}

export class OptionCatalogModel extends BaseModel<OptionCatalog> {
  private static instance: OptionCatalogModel;
  constructor() {
    const schema = createMongooseSchema(fields, {
      includeTimestamps: true,
      includeSoftDelete: true
    });
    super('OptionCatalog', fields, schema)
  }

  public static getInstance(): OptionCatalogModel {
    if (!OptionCatalogModel.instance) {
      OptionCatalogModel.instance = new OptionCatalogModel();
    }
    return OptionCatalogModel.instance;
  }
}
