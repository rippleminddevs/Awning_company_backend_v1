import Joi from 'joi'

export const CustomerValidator = {
  create: Joi.object({
    name: Joi.string().required(),
    emailAddress: Joi.string().email().required(),
    phone: Joi.string().required(),
    address: Joi.string().required(),
    city: Joi.string().required(),
    zipCode: Joi.string().required(),
    notes: Joi.string().optional().default(null),
    serviceRequested: Joi.string().required(),
    source: Joi.string().required(),
  }),

  update: Joi.object({
    name: Joi.string().optional(),
    emailAddress: Joi.string().email().optional(),
    phone: Joi.string().optional(),
    address: Joi.string().optional(),
    city: Joi.string().optional(),
    zipCode: Joi.string().optional(),
    notes: Joi.string().optional().default(null),
    serviceRequested: Joi.string().optional(),
    source: Joi.string().optional(),
  }),
}
