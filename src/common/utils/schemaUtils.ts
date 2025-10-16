import mongoose from 'mongoose'
import { FieldConfig, FieldsConfig } from '../interfaces/fieldTypes'

const getMongooseDataType = (type: string): any => {
  switch (type) {
    case 'ObjectId':
      return mongoose.Schema.Types.ObjectId
    case 'number':
    case 'integer':
      return Number
    case 'float':
      return mongoose.Schema.Types.Decimal128
    case 'boolean':
      return Boolean
    case 'string':
      return String
    case 'date':
      return Date
    case 'json':
      return mongoose.Schema.Types.Mixed
    default:
      return mongoose.Schema.Types.Mixed // Fallback for unknown types
  }
}

export const createMongooseSchema = (
  fields: FieldsConfig,
  options: {
    includeTimestamps?: boolean
    includeSoftDelete?: boolean
  } = {}
): mongoose.Schema => {
  const schemaDefinition: mongoose.SchemaDefinition = {}

  for (const [key, field] of Object.entries(fields)) {
    if (key === '_id') continue

    const fieldConfig = field as FieldConfig

    if (fieldConfig.type === 'subdocument' && fieldConfig.document) {
      // Object (nested) subdocument
      const subSchema = createMongooseSchema(fieldConfig.document)
      schemaDefinition[key] = {
        type: subSchema,
        required: fieldConfig.nullable === false,
        ...(fieldConfig.default !== undefined ? { default: fieldConfig.default } : {}),
      }
    } else if (fieldConfig.type === 'array') {
      let itemType: any = String

      if (fieldConfig.subdocument && fieldConfig.document) {
        const subSchema = createMongooseSchema(fieldConfig.document)
        itemType = subSchema
      } else if (fieldConfig.itemType) {
        itemType = getMongooseDataType(fieldConfig.itemType)
      }

      schemaDefinition[key] = {
        type: [itemType],
        required: fieldConfig.nullable === false,
        ...(fieldConfig.default !== undefined ? { default: fieldConfig.default } : {}),
      }
    } else {
      const baseType = getMongooseDataType(fieldConfig.mongooseType || fieldConfig.type)

      schemaDefinition[key] = {
        type: baseType,
        required: fieldConfig.nullable === false,
        ...(fieldConfig.default !== undefined ? { default: fieldConfig.default } : {}),
        ...(fieldConfig.unique ? { unique: true } : {}),
        ...(fieldConfig.enum ? { enum: fieldConfig.enum } : {}),
        ...(fieldConfig.min !== undefined ? { min: fieldConfig.min } : {}),
        ...(fieldConfig.max !== undefined ? { max: fieldConfig.max } : {}),
        ...(fieldConfig.ref ? { ref: fieldConfig.ref } : {}),
        sparse: true,
      }
    }
  }

  // Optional soft delete
  if (options.includeSoftDelete && !fields['deletedAt']) {
    schemaDefinition['deletedAt'] = {
      type: Date,
      default: null,
    }
  }

  const schemaOptions: mongoose.SchemaOptions = {}

  if (options.includeTimestamps) {
    schemaOptions.timestamps = { createdAt: 'createdAt', updatedAt: 'updatedAt' }
  }

  return new mongoose.Schema(schemaDefinition, schemaOptions)
}
