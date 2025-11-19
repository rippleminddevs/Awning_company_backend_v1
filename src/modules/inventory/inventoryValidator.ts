import Joi from 'joi'

export const InventoryValidator = {
  create: Joi.object({
    awningType: Joi.string().required(),
    product: Joi.string().required(),
    updateType: Joi.string().required().valid('Add', 'Remove'),
    quantity: Joi.number().required(),
    storageLocation: Joi.string().required(),
    reason: Joi.string().optional().default(null),
    sufficientStock: Joi.number().optional().default(0),
    lowStock: Joi.number().optional().default(0),
    criticalLow: Joi.number().optional().default(0),
    reorderThreshold: Joi.number().optional().default(0),
    sku: Joi.string().optional().default(null),
  }),

  update: Joi.object({
    awningType: Joi.string().optional(),
    product: Joi.string().optional(),
    updateType: Joi.string().optional().valid('Add', 'Remove'),
    quantity: Joi.number().optional(),
    storageLocation: Joi.string().optional(),
    reason: Joi.string().optional(),
    sufficientStock: Joi.number().optional(),
    lowStock: Joi.number().optional(),
    criticalLow: Joi.number().optional(),
    reorderThreshold: Joi.number().optional(),
    sku: Joi.string().optional(),
  }),
}
