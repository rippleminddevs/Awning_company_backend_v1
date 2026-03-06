import mongoose from 'mongoose'
import { FieldsConfig } from '../../common/interfaces/fieldTypes'
import { BaseModel } from '../../common/core/baseModel'
import { Customer } from './customerInterface'
import { createMongooseSchema } from '../../common/utils/schemaUtils'

const fields: FieldsConfig = {
  customer_type: {
    type: 'string',
    nullable: false,
    enum: ['residential', 'commercial', 'contractor', 'designer', 'property_manager', 'hoa']
  },
  name: {
    type: 'string',
    nullable: false,
  },
  firstName: {
    type: 'string',
    nullable: true,
    default: null,
  },
  lastName: {
    type: 'string',
    nullable: true,
    default: null,
  },
  emailAddress: {
    type: 'string',
    nullable: false,
  },
  businessName: {
    type: 'string',
    nullable: true,
    default: null,
  },
  companyContact: {
    type: 'string',
    nullable: true,
    default: null,
  },
  onsiteContact: {
    type: 'string',
    nullable: true,
    default: null,
  },
  phone: {
    type: 'string',
    nullable: true,
    default: null,
  },
  addressLine1: {
    type: 'string',
    nullable: false,
  },
  addressLine2: {
    type: 'string',
    nullable: true,
    default: null,
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
    nullable: true,
    default: null,
  },
  source: {
    type: 'string',
    nullable: true,
    default: null,
  },
  crmStatus: {
    type: 'string',
    nullable: false,
    enum: ['active_lead','quoted','sold','follow_up','dead','installed'],
    default: 'active_lead'
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
