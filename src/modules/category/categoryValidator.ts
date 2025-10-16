import Joi from 'joi'

export const CategoryValidator = {
  create: Joi.object({
    name: Joi.string().required(),
  }),

  update: Joi.object({
    name: Joi.string().optional(),
  }),
}
