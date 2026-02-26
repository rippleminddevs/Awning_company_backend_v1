import mongoose from 'mongoose'
import { FieldsConfig } from '../../common/interfaces/fieldTypes'
import { BaseModel } from '../../common/core/baseModel'
import { ProductType } from './productTypeInterface'
import { createMongooseSchema } from '../../common/utils/schemaUtils'

const fields: FieldsConfig = {
  category_id: {
    type: 'ObjectId',
    ref: 'ProductCategory',
    nullable: false,
  },
  slug: {
    type: 'string',
    nullable: false,
    unique: true,
  },
  display_name: {
    type: 'string',
    nullable: false,
  },
  full_description: {
    type: 'string',
    nullable: false,
  },
  sort_order: {
    type: 'number',
    nullable: false,
  },
  is_active: {
    type: 'boolean',
    nullable: false,
  },
  drive_type: {
    type: 'string',
    nullable: false,
  },
  dimension_config: {
    type: 'json',
    nullable: true,
  },
  fabric_config: {
    type: 'json',
    nullable: true,
  },
  available_options: {
    type: 'json',
    nullable: true,
  },
  installation: {
    type: 'json',
    nullable: true,
  },
  alumawood_config: {
    type: 'json',
    nullable: true,
  },
  louvered_config: {
    type: 'json',
    nullable: true,
  },
  fixed_awning_extras: {
    type: 'json',
    nullable: true,
  },
  infinity_config: {
    type: 'json',
    nullable: true,
  },
  sub_category_slug: {
    type: 'string',
    nullable: true,
  },
  price_lookup_mode: {
    type: 'string',
    nullable: true,
  },
  dimension_fields: {
    type: 'json',
    nullable: true,
  },
  option_groups: {
    type: 'array',
    nullable: true,
  },
  extras: {
    type: 'json',
    nullable: true,
  }
}

export class ProductTypeModel extends BaseModel<ProductType> {
  private static instance: ProductTypeModel;
  constructor() {
    const schema = createMongooseSchema(fields, {
      includeTimestamps: true,
      includeSoftDelete: true
    })
    super('ProductType', fields, schema)
  }

  public static getInstance(): ProductTypeModel {
    if (!ProductTypeModel.instance) {
      ProductTypeModel.instance = new ProductTypeModel();
    }
    return ProductTypeModel.instance;
  }
}
