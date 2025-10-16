import mongoose from 'mongoose'
import { FieldsConfig } from '../../common/interfaces/fieldTypes'
import { BaseModel } from '../../common/core/baseModel'
import { Category } from './categoryInterface'
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

export class CategoryModel extends BaseModel<Category> {
  private static instance: CategoryModel;
  constructor() {
    const schema = createMongooseSchema(fields, {
      includeTimestamps: true,
    })
    super('Category', fields, schema)
  }

  public static getInstance(): CategoryModel {
    if (!CategoryModel.instance) {
      CategoryModel.instance = new CategoryModel();
    }
    return CategoryModel.instance;
  }
}
