import Joi from 'joi'

export const ProductValidator = {
  create: Joi.object({
    type: Joi.string().required(),
    name:  Joi.string().required(),
    colors: Joi.array().items().required(),
    installation: Joi.string().required(),
    hood: Joi.string().optional().default("No"),
    description: Joi.string().required(),
    width_fraction: Joi.string().required(),
    width_ft: Joi.object({
      min: Joi.number().required(),
      max: Joi.number().required()
    }).required(),
    width_in: Joi.object({
      min: Joi.number().required(),
      max: Joi.number().required()
    }).required(),
    height_ft: Joi.object({
      min: Joi.number().required(),
      max: Joi.number().required()
    }).required(),
    image: Joi.string().optional(),
    pricing: Joi.object({
      basePrice: Joi.number().required(),
      finalPrice: Joi.number().required(),
      rules: Joi.array().items().required()
    }).optional().default(null),
  }),

  update: Joi.object({
    type: Joi.string().optional(),
    name:  Joi.string().optional(),
    colors: Joi.array().items().optional(),
    installation: Joi.string().optional(),
    hood: Joi.string().optional().default("No"),
    description: Joi.string().optional(),
    width_fraction: Joi.string().optional(),
    width_ft: Joi.object({
      min: Joi.number().required(),
      max: Joi.number().required()
    }).optional(),
    width_in: Joi.object({
      min: Joi.number().required(),
      max: Joi.number().required()
    }).optional(),
    height_ft: Joi.object({
      min: Joi.number().required(),
      max: Joi.number().required()
    }).optional(),
    image: Joi.string().optional(),
    pricing: Joi.object({
      basePrice: Joi.number().required(),
      finalPrice: Joi.number().required(),
      rules: Joi.array().items().required()
    }).optional().default(null),
  }),

  getProducts: Joi.object({
    type: Joi.string().optional(),
  }),

  searchProducts: Joi.object({
    name: Joi.string().optional(),
  }),

}
