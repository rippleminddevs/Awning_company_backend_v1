import mongoose from 'mongoose'
import { FieldsConfig } from '../../common/interfaces/fieldTypes'
import { BaseModel } from '../../common/core/baseModel'
import { ProductSubCategory } from './productSubCategoryInterface'
import { createMongooseSchema } from '../../common/utils/schemaUtils'

const fields: FieldsConfig = {
  category_slug: {
    type: 'string',
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
  description: {
    type: 'string',
    nullable: true,
  },
  sort_order: {
    type: 'number',
    nullable: true,
  },
  is_active: {
    type: 'boolean',
    nullable: true,
  },
}

export class ProductSubCategoryModel extends BaseModel<ProductSubCategory> {
  private static instance: ProductSubCategoryModel;
  constructor() {
    const schema = createMongooseSchema(fields, {
      includeSoftDelete: true,
      includeTimestamps: true
    })
    super('ProductSubCategory', fields, schema)
  }

  public static getInstance(): ProductSubCategoryModel {
    if (!ProductSubCategoryModel.instance) {
      ProductSubCategoryModel.instance = new ProductSubCategoryModel();
    }
    return ProductSubCategoryModel.instance;
  }
}
