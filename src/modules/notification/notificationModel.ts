import mongoose from 'mongoose'
import { FieldsConfig } from '../../common/interfaces/fieldTypes'
import { BaseModel } from '../../common/core/baseModel'
import { Notification } from './notificationInterface'
import { createMongooseSchema } from '../../common/utils/schemaUtils'

const fields: FieldsConfig = {
  type: {
    type: 'string',
    enum: ['Appointment', 'New-Appointment'],
    nullable: false,
  },
  refType: {
    type: 'string',
    enum: ['Appointment'],
    nullable: false,
  },
  refId: {
    type: 'string',
    mongooseType: 'ObjectId',
    nullable: false,
  },
  targets: {
    type: 'array',
    itemType: 'ObjectId',
    mongooseType: 'ObjectId',
    ref: 'User',
    nullable: false,
    default: [],
  },
  readBy: {
    type: 'array',
    itemType: 'ObjectId',
    mongooseType: 'ObjectId',
    ref: 'User',
    nullable: false,
    default: [],
  },
  data: {
    type: 'object',
    nullable: true,
  },
  createdBy: {
    type: 'string',
    mongooseType: 'ObjectId',
    ref: 'User',
    nullable: true,
    default: null,
  },
}

export class NotificationModel extends BaseModel<Notification> {
  private static instance: NotificationModel;
  constructor() {
    const schema = createMongooseSchema(fields,{
      includeTimestamps: true
    })
    super('Notification', fields, schema)
  }

  public static getInstance(): NotificationModel {
    if (!NotificationModel.instance) {
      NotificationModel.instance = new NotificationModel();
    }
    return NotificationModel.instance;
  }
}
