import mongoose from 'mongoose'
import { FieldsConfig } from '../../common/interfaces/fieldTypes'
import { BaseModel } from '../../common/core/baseModel'
import { ProductType } from './productTypeInterface'
import { createMongooseSchema } from '../../common/utils/schemaUtils'

const fields: FieldsConfig = {
  category_slug: {
    type: 'string',
    nullable: false,
  },
  sub_category_slug: {
    type: 'string',
    nullable: true,
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
  price_lookup_mode: {
    type: 'string',
    nullable: true,
  },

  product_fields: {
    type: 'json',
    nullable: true,
  },

  // ✅ Match DB naming
  dimension_fields: {
    type: 'json',
    nullable: true,
  },

  fabric_config: {
    type: 'json',
    nullable: true,
  },

  option_groups: {
    type: 'array',
    nullable: true,
  },

  installation: {
    type: 'json',
    nullable: true,
  },

  // Optional configs (keep only if actually used)
  pricing: {
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
