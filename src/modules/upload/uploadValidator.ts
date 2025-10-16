import Joi from 'joi'

export const UploadValidator = {
  create: Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
  }),

  update: Joi.object({
    name: Joi.string().optional(),
    email: Joi.string().email().optional(),
    password: Joi.string().min(6).optional(),
  }),
}
