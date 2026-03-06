import mongoose from 'mongoose'
import { FieldsConfig } from '../../common/interfaces/fieldTypes'
import { BaseModel } from '../../common/core/baseModel'
import { ProductCategory } from './productCategoryInterface'
import { createMongooseSchema } from '../../common/utils/schemaUtils'

const fields: FieldsConfig = {
  display_name: {
    type: 'string',
    nullable: false,
  },
  slug: {
    type: 'string',
    nullable: false,
    unique: true,
  },
  sort_order: {
    type: 'number',
    nullable: false,
  },
  is_active: {
    type: 'boolean',
    nullable: false,
  },
  has_sub_categories: {
    type: 'boolean',
    nullable: true,
  },
}

export class ProductCategoryModel extends BaseModel<ProductCategory> {
  private static instance: ProductCategoryModel;
  constructor() {
    const schema = createMongooseSchema(fields, {
      includeTimestamps: true,
      includeSoftDelete: true
    })
    super('ProductCategory', fields, schema)
  }

  public static getInstance(): ProductCategoryModel {
    if (!ProductCategoryModel.instance) {
      ProductCategoryModel.instance = new ProductCategoryModel();
    }
    return ProductCategoryModel.instance;
  }
}
