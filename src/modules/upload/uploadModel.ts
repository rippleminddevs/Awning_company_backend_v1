import { FieldsConfig } from '../../common/interfaces/fieldTypes'
import { createMongooseSchema } from '../../common/utils/schemaUtils'
import { BaseModel } from '../../common/core/baseModel'
import { Upload } from './uploadInterface'

const fields: FieldsConfig = {
  _id: {
    type: 'integer',
    mongooseType: 'ObjectId',
    nullable: false,
    primaryKey: true,
    autoIncrement: true,
  },
  filename: {
    type: 'string',
    nullable: false,
  },
  originalName: {
    type: 'string',
    nullable: false,
  },
  size: {
    type: 'number',
    nullable: false,
  },
  mimeType: {
    type: 'string',
    nullable: false,
  },
  path: {
    type: 'string',
    nullable: false,
  },
  url: {
    type: 'string',
    nullable: true,
  },
  uploadedHost: {
    type: 'string',
    nullable: false,
  },
  isPublic: {
    type: 'boolean',
    nullable: false,
    default: true,
  },
  user: {
    type: 'number',
    mongooseType: 'ObjectId',
    nullable: true,
    ref: 'User',
  },
  metadata: {
    type: 'json',
    nullable: true,
  },
}

export class UploadModel extends BaseModel<Upload> {
  private static instance: UploadModel
  constructor() {
    const schema = createMongooseSchema(fields, {
      includeTimestamps: true,
      includeSoftDelete: true,
    })
    super('Upload', fields, schema)
  }

  public static getInstance = (): UploadModel => {
    if (!UploadModel.instance) {
      UploadModel.instance = new UploadModel()
    }
    return UploadModel.instance
  }
}
