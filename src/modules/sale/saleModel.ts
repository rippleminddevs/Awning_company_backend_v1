import mongoose from 'mongoose'
import { FieldsConfig } from '../../common/interfaces/fieldTypes'
import { BaseModel } from '../../common/core/baseModel'
import { Sale } from './saleInterface'

const fields: FieldsConfig = {
  name: {
    type: 'string',
    nullable: false,
  },
  email: {
    type: 'string',
    nullable: false,
    unique: true,
  },
}

export class SaleModel extends BaseModel<Sale> {
  private static instance: SaleModel;
  constructor() {
    super('Sale', fields)
  }

  public static getInstance(): SaleModel {
    if (!SaleModel.instance) {
      SaleModel.instance = new SaleModel();
    }
    return SaleModel.instance;
  }
}
