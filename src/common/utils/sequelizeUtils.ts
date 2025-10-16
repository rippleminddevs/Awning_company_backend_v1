import { and, DataTypes } from 'sequelize'
import { FieldConfig } from '../interfaces/fieldTypes'

const getSequelizeDataType = (type: string) => {
  switch (type) {
    case 'number':
      return DataTypes.INTEGER
    case 'float':
      return DataTypes.FLOAT
    case 'bigint':
      return DataTypes.BIGINT
    case 'boolean':
      return DataTypes.BOOLEAN
    case 'string':
      return DataTypes.STRING
    case 'text':
      return DataTypes.TEXT
    case 'date':
      return DataTypes.DATE
    case 'json':
      return DataTypes.JSON
    case 'array':
      return DataTypes.ARRAY(DataTypes.STRING)
    default:
      return DataTypes.STRING
  }
}

export const createSequelizeAttributes = (fields: any) => {
  const attributes: any = {}

  for (const [key, field] of Object.entries(fields)) {
    const fieldConfig = field as FieldConfig
    attributes[key] = {
      type: getSequelizeDataType(fieldConfig.type),
      allowNull: fieldConfig.nullable ?? true,
      primaryKey: fieldConfig.primaryKey || false,
      autoIncrement: fieldConfig.autoIncrement || false,
      ...(fieldConfig.unique ? { unique: fieldConfig.unique || false } : {}),
      ...(fieldConfig.default !== undefined ? { defaultValue: fieldConfig.default } : {}),
    }
  }
  const timestampsFields = ['createdAt', 'updatedAt']
  for (const field of timestampsFields) {
    if (!fields[field]) {
      attributes[field] = {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        allowNull: false,
      }
    }
  }

  if (!fields['deletedAt']) {
    attributes['deletedAt'] = {
      type: DataTypes.DATE,
      defaultValue: null,
      allowNull: true,
    }
  }

  return attributes
}
