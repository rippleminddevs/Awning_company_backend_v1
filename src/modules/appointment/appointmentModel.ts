import mongoose from 'mongoose'
import { FieldsConfig } from '../../common/interfaces/fieldTypes'
import { BaseModel } from '../../common/core/baseModel'
import { Appointment } from './appointmentInterface'
import { createMongooseSchema } from '../../common/utils/schemaUtils'

const notificationsSchema: FieldsConfig = {
  emailToCustomer: {
    type: 'boolean',
    nullable: true,
    default: false,
  },
  emailToManager: {
    type: 'boolean',
    nullable: true,
    default: false,
  },
  textMessages: {
    type: 'boolean',
    nullable: true,
    default: false,
  },
}

const fields: FieldsConfig = {
  customerId: {
    type: 'ObjectId',
    nullable: false,
    ref: 'Customer'
  },
  customerType: {
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
  businessName: {
    type: 'string',
    nullable: true,
    default: null,
  },
  billAddress: {
    type: 'string',
    nullable: true,
    default: null,
  },
  projectManagerContact: {
    type: 'string',
    nullable: true,
    default: null,
  },
  companyContact: {
    type: 'string',
    nullable: true,
    default: null,
  },
  source: {
    type: 'string',
    nullable: true,
    default: null,
  },
  emailAddress: {
    type: 'string',
    nullable: false,
  },
  address1: {
    type: 'string',
    nullable: false,
  },
  address2: {
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
  bestContact: {
    type: 'string',
    nullable: false,
  },
  customerNotes: {
    type: 'string',
    nullable: true,
    default: null,
  },
  service: {
    type: 'string',
    mongooseType: 'ObjectId',
    ref: 'Service',
    nullable: false,
  },
  staff: {
    type: 'string',
    mongooseType: 'ObjectId',
    ref: 'User',
    nullable: false,
  },
  date: {
    type: 'date',
    nullable: false,
  },
  time: {
    type: 'date',
    nullable: false,
  },
  duration: {
    type: 'string',
    nullable: false,
  },
  pre_status:{
    type: 'string',
    nullable: false,
    enum: ['scheduled','confirmed','call_back','canceled','tentative','left_voicemail'],
    default: 'scheduled'
  },
  post_status:{
    type: 'string',
    nullable: false,
    enum: ['scheduled', 'sold','quoted','no_show','no_can_do','awaiting_quote','sale_pending','followed_up'],
    default: 'scheduled'
  },
  status: {
    type: 'string',
    nullable: false,
  },
  internalNotes: {
    type: 'string',
    nullable: true,
    default: null,
  },
  notifications: {
    type: 'subdocument',
    document: notificationsSchema,
    nullable: true,
    default: null,
  },
  phoneNumber: {
    type: 'string',
    nullable: true,
    default: null,
  },
  createdBy: {
    type: 'string',
    mongooseType: 'ObjectId',
    ref: 'User',
    nullable: false,
  },
  billingCity: {
    type: 'string',
    nullable: true,
    default: null,
  },
  billingContactName: {
    type: 'string',
    nullable: true,
    default: null,
  },
  billingDept: {
    type: 'string',
    nullable: true,
    default: null,
  },
  billingPhone: {
    type: 'string',
    nullable: true,
    default: null,
  },
  billingZip: {
    type: 'string',
    nullable: true,
    default: null,
  },
  onSiteProjectContactName: {
    type: 'string',
    nullable: true,
    default: null,
  },
  onSiteProjectContactNumber: {
    type: 'string',
    nullable: true,
    default: null,
  },
}

export class AppointmentModel extends BaseModel<Appointment> {
  private static instance: AppointmentModel
  constructor() {
    const schema = createMongooseSchema(fields, {
      includeTimestamps: true,
    })
    super('Appointment', fields, schema)
  }

  public static getInstance(): AppointmentModel {
    if (!AppointmentModel.instance) {
      AppointmentModel.instance = new AppointmentModel()
    }
    return AppointmentModel.instance
  }
}
