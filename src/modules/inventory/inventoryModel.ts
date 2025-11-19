import { FieldsConfig } from '../../common/interfaces/fieldTypes'
import { BaseModel } from '../../common/core/baseModel'
import { Inventory } from './inventoryInterface'
import { createMongooseSchema } from '../../common/utils/schemaUtils'

const fields: FieldsConfig = {
  awningType: {
    type: 'string',
    mongooseType: 'ObjectId',
    ref: 'Category',
    nullable: false,
  },
  product: {
    type: 'string',
    mongooseType: 'ObjectId',
    ref: 'Product',
    nullable: false,
  },
  updateType: {
    type: 'string',
    nullable: false,
    enum: ['Add', 'Remove'],
  },
  quantity: {
    type: 'number',
    nullable: false,
    default: 0,
  },
  storageLocation: {
    type: 'string',
    nullable: false,
  },
  reason: {
    type: 'string',
    nullable: true,
    default: null
  },
  sufficientStock: {
    type: 'number',
    nullable: false,
    default: 0,
  },
  lowStock: {
    type: 'number',
    nullable: false,
    default: 0,
  },
  criticalLow: {
    type: 'number',
    nullable: false,
    default: 0,
  },
  reorderThreshold: {
    type: 'number',
    nullable: false,
    default: 0,
  },
  sku: {
    type: 'string',
    nullable: true,
    default: null
  },
  createdBy: {
    type: 'string',
    mongooseType: 'ObjectId',
    ref: 'User',
    nullable: false,
  },
}

export class InventoryModel extends BaseModel<Inventory> {
  private static instance: InventoryModel;
  constructor() {
    const schema = createMongooseSchema(fields, {
      includeTimestamps: true,
    })
    super('Inventory', fields, schema)
  }

  public static getInstance(): InventoryModel {
    if (!InventoryModel.instance) {
      InventoryModel.instance = new InventoryModel();
    }
    return InventoryModel.instance;
  }
}
