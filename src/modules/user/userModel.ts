import { FieldsConfig } from '../../common/interfaces/fieldTypes'
import { BaseModel } from '../../common/core/baseModel'
import { User } from './userInterface'
import { createMongooseSchema } from '../../common/utils/schemaUtils'

const locationSchema: FieldsConfig = {
  address: {
    type: 'string',
    nullable: true,
  },
  latitude: {
    type: 'number',
    nullable: false,
  },
  longitude: {
    type: 'number',
    nullable: false,
  },
}

const fields: FieldsConfig = {
  _id: {
    type: 'integer',
    mongooseType: 'ObjectId',
    nullable: false,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: 'string',
    nullable: false,
  },
  email: {
    type: 'string',
    nullable: false,
    unique: true,
  },
  password: {
    type: 'string',
    nullable: false,
  },
  googleId: {
    type: 'string',
    nullable: true,
  },
  facebookId: {
    type: 'string',
    nullable: true,
  },
  deviceTokens: {
    type: 'array',
    nullable: true,
  },
  location: {
    type: 'subdocument',
    nullable: true,
    document: locationSchema,
  },
  profilePicture: {
    type: 'string',
    mongooseType: 'ObjectId',
    ref: 'Upload',
    nullable: true,
  },
  phoneNumber: {
    type: 'string',
    nullable: true,
  },
  isVerified: {
    type: 'boolean',
    default: false,
  },
  role: {
    type: 'string',
    default: 'salesperson',
    enum: ['salesperson', 'manager', 'superadmin'],
  },
  isAdmin: {
    type: 'boolean',
    default: false,
  },
}

export class UserModel extends BaseModel<User> {
  private static instance: UserModel
  constructor() {
    const schema = createMongooseSchema(fields, {
      includeSoftDelete: true,
      includeTimestamps: true,
    })
    super('User', fields, schema)
  }

  public static getInstance(): UserModel {
    if (!UserModel.instance) {
      UserModel.instance = new UserModel()
    }
    return UserModel.instance
  }
}
