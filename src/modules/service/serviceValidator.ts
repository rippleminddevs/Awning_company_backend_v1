import Joi from 'joi'

export const ServiceValidator = {
  create: Joi.object({
    name: Joi.string().required(),
  }),

  update: Joi.object({
    name: Joi.string().optional(),
  }),
}
