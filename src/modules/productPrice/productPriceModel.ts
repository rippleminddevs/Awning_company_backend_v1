import mongoose from 'mongoose'
import { FieldsConfig } from '../../common/interfaces/fieldTypes'
import { BaseModel } from '../../common/core/baseModel'
import { ProductPrice } from './productPriceInterface'
import { createMongooseSchema } from '../../common/utils/schemaUtils'

const fields: FieldsConfig = {
  product_type_slug: {
    type: 'string',
    nullable: false,
  },
  width_ft: {
    type: 'number',
    nullable: false,
  },
  projection_ft: {
    type: 'number',
    nullable: false,
  },
  msrp: {
    type: 'number',
    nullable: false,
  },
}

export class ProductPriceModel extends BaseModel<ProductPrice> {
  private static instance: ProductPriceModel;
  constructor() {
    const schema = createMongooseSchema(fields, {
      includeTimestamps: true,
      includeSoftDelete: true
    });
    super('ProductPrice', fields, schema)
  }

  public static getInstance(): ProductPriceModel {
    if (!ProductPriceModel.instance) {
      ProductPriceModel.instance = new ProductPriceModel();
    }
    return ProductPriceModel.instance;
  }
}
