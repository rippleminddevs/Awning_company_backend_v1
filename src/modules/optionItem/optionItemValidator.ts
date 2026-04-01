import Joi from 'joi'

export const OptionItemValidator = {
  create: Joi.object({
    label: Joi.string().required(),
    value: Joi.string().pattern(/^[a-z0-9_]+$/).required(),
    price_modifier: Joi.number().optional().default(0),
    is_active: Joi.boolean().optional().default(true),
  }),

  update: Joi.object({
    label: Joi.string().optional(),
    value: Joi.string().pattern(/^[a-z0-9_]+$/).optional(),
    price_modifier: Joi.number().optional(),
    is_active: Joi.boolean().optional(),
  }),
}
