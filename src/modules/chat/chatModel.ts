import mongoose from 'mongoose'
import { FieldsConfig } from '../../common/interfaces/fieldTypes'
import { BaseModel } from '../../common/core/baseModel'
import { Chat } from './chatInterface'
import { createMongooseSchema } from '../../common/utils/schemaUtils'

const fields: FieldsConfig = {
  participants: {
    type: 'array',
    mongooseType: 'ObjectId',
    itemType: 'ObjectId',
    ref: 'User',
    nullable: false,
    default: [],
  },
  lastMessage: {
    type: 'ObjectId',
    mongooseType: 'ObjectId',
    nullable: true,
    default: null,
    ref: 'Message'
  },
  createdBy: {
    type: 'ObjectId',
    mongooseType: 'ObjectId',
    ref: 'User'
  }
}

export class ChatModel extends BaseModel<Chat> {
  private static instance: ChatModel;
  constructor() {
    const schema = createMongooseSchema(fields, {
      includeTimestamps: true,
    })
    super('Chat', fields, schema)
  }

  public static getInstance(): ChatModel {
    if (!ChatModel.instance) {
      ChatModel.instance = new ChatModel();
    }
    return ChatModel.instance;
  }
}
