import mongoose from 'mongoose'
import { FieldsConfig } from '../../common/interfaces/fieldTypes'
import { BaseModel } from '../../common/core/baseModel'
import { Customer } from './customerInterface'
import { createMongooseSchema } from '../../common/utils/schemaUtils'

const fields: FieldsConfig = {
  name: {
    type: 'string',
    nullable: false,
  },
  emailAddress: {
    type: 'string',
    nullable: false,
  },
  phone: {
    type: 'string',
    nullable: false,
  },
  address: {
    type: 'string',
    nullable: false,
  },
  city: {
    type: 'string',
    nullable: false,
  },
  zipCode: {
    type: 'string',
    nullable: false,
  },
  notes: {
    type: 'string',
    nullable: true,
    default: null,
  },
  serviceRequested: {
    type: 'string',
    mongooseType: 'ObjectId',
    ref: 'Service',
    nullable: false,
  },
  source: {
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

export class CustomerModel extends BaseModel<Customer> {
  private static instance: CustomerModel;
  constructor() {
    const schema = createMongooseSchema(fields,{
      includeTimestamps: true,
    })
    super('Customer', fields, schema)
  }

  public static getInstance(): CustomerModel {
    if (!CustomerModel.instance) {
      CustomerModel.instance = new CustomerModel();
    }
    return CustomerModel.instance;
  }
}
