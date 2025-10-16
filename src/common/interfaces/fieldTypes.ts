export interface FieldConfig {
  type: string // Data type (e.g., 'string', 'number', 'boolean')
  mongooseType?: string // Mongoose-specific type (e.g., 'ObjectId')
  nullable?: boolean // Unifies allowNull & required
  primaryKey?: boolean // Whether the field is a primary key
  autoIncrement?: boolean // Whether the field auto-increments (for Sequelize)
  unique?: boolean // Whether the field must be unique
  default?: any // Default value for the field
  ref?: string // Reference to another model (for Mongoose)
  document?: FieldsConfig // Subdocument schema (for nested objects)
  subdocument?: boolean // Indicates if the field is a subdocument
  enum?: any[] // Enum for predefined values
  min?: number // Minimum value for the field
  max?: number // Maximum value for the field
  regex?: RegExp // Regex pattern validation
  itemType?: string // Type of array items (e.g., 'string', 'number')
  validate?: (value: any) => boolean // Custom validation function
}

export interface FieldsConfig {
  [key: string]: FieldConfig // Key-value pairs of field names and their configurations
}
