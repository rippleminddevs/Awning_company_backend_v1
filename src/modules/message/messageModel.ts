import mongoose from 'mongoose'
import { FieldsConfig } from '../../common/interfaces/fieldTypes'
import { BaseModel } from '../../common/core/baseModel'
import { Message } from './messageInterface'
import { createMongooseSchema } from '../../common/utils/schemaUtils'

const fields: FieldsConfig = {
  chatId: {
    type: 'ObjectId',
    nullable: false,
  },
  sender: {
    type: 'ObjectId',
    nullable: false,
    ref: 'User'
  },
  content: {
    type: 'string',
    nullable: true,
  },
  content_type: {
    type: 'string',
    nullable: true,
    default: 'text',
    enum: ['text', 'media']
  },
  mediaType: {
    type: 'string',
    nullable: true,
  },
  readBy: {
    type: 'array',
    itemType: 'ObjectId',
    ref: 'User',
    nullable: false,
    default: [],
  }
}

export class MessageModel extends BaseModel<Message> {
  private static instance: MessageModel;
  constructor() {
    const schema = createMongooseSchema(fields,{
      includeTimestamps: true,
      includeSoftDelete: true,
    })
    super('Message', fields, schema)
  }

  public static getInstance(): MessageModel {
    if (!MessageModel.instance) {
      MessageModel.instance = new MessageModel();
    }
    return MessageModel.instance;
  }
}
