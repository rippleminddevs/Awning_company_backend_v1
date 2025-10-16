import mongoose from 'mongoose'
import { FieldsConfig } from '../../common/interfaces/fieldTypes'
import { BaseModel } from '../../common/core/baseModel'
import { Product } from './productInterface'
import { createMongooseSchema } from '../../common/utils/schemaUtils'

const widthInFeet: FieldsConfig = {
  min: {
    type: 'number',
    nullable: false,
  },
  max: {
    type: 'number',
    nullable: false,
  },
}

const widthInInches: FieldsConfig = {
  min: {
    type: 'number',
    nullable: false,
  },
  max: {
    type: 'number',
    nullable: false,
  },
}

const heightInFeet: FieldsConfig = {
  min: {
    type: 'number',
    nullable: false,
  },
  max: {
    type: 'number',
    nullable: false,
  },
}

const pricingRule: FieldsConfig = {
  condition: {
    type: 'string',
    nullable: true,
  },
  baseValue: {
    type: 'string',
    nullable: true,
  },
  variationIncrement: {
    type: 'number',
    nullable: true,
  },
}

const Pricing: FieldsConfig ={
  basePrice: {
    type: 'number'
  },
  finalPrice: {
    type: 'number'
  },
  rules: {
    type: 'array',
    document: pricingRule,
    subdocument: true,
    nullable: false,
  },
}

const fields: FieldsConfig = {
  type: {
    type: 'string',
    mongooseType: 'ObjectId',
    ref: 'Category',
    nullable: false,
  },
  name: {
    type: 'string',
    nullable: false,
  },
  colors: {
    type: 'array',
    nullable: false,
  },
  installation: {
    type: 'string',
    nullable: false,
  },
  hood: {
    type: 'string',
    nullable: false,
  },
  description: {
    type: 'string',
    nullable: false,
  },
  width_fraction: {
    type: 'string',
    nullable: false,
  },
  width_ft: {
    type: 'subdocument',
    document: widthInFeet,
    nullable: false,
  },
  width_in: {
    type: 'subdocument',
    document: widthInInches,
    nullable: false,
  },
  height_ft: {
    type: 'subdocument',
    document: heightInFeet,
    nullable: false,
  },
  image: {
    type: 'string',
    mongooseType: 'ObjectId',
    ref: 'Upload',
    nullable: true,
    default: null,
  },
  pricing: {
    type: 'subdocument',
    document: Pricing,
    nullable: true,
    default: null,
  },
  createdBy: {
    type: 'string',
    mongooseType: 'ObjectId',
    ref: 'User',
    nullable: false,
  },
}

export class ProductModel extends BaseModel<Product> {
  private static instance: ProductModel;
  constructor() {
    const schema = createMongooseSchema(fields, {
      includeTimestamps: true,
    })
    super('Product', fields, schema)
  }

  public static getInstance(): ProductModel {
    if (!ProductModel.instance) {
      ProductModel.instance = new ProductModel();
    }
    return ProductModel.instance;
  }
}
