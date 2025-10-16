import Joi from 'joi'

export const ChatValidator = {
  create: Joi.object({
    userId: Joi.string().optional(),
    participants: Joi.array().items(Joi.string().required()).optional(),
  }),

  update: Joi.object({
    userId: Joi.string().optional(),
    participants: Joi.array().items(Joi.string().required()).optional(),
  }),

  messages: Joi.object({
    id: Joi.string()
      .pattern(/^[0-9a-fA-F]{24}$/)
      .required()
      .messages({
        'string.pattern.base': 'Invalid userId format',
      })
  }),

  send_message: Joi.object({
    userId: Joi.string()
      .pattern(/^[0-9a-fA-F]{24}$/)
      .required()
      .messages({
        'string.pattern.base': 'Invalid userId format',
      }),
    content: Joi.string().allow(null, ''),
    content_type: Joi.string()
      .valid('text', 'media')
      .required()
      .messages({
        'any.only': 'content_type must be either "text" or "media"',
      }),
  }),

  getById: Joi.object({
    id: Joi.string()
      .pattern(/^[0-9a-fA-F]{24}$/)
      .required()
      .messages({
        'string.pattern.base': 'Invalid userId format',
      })
  }),
  
  getAll: Joi.object({
    paginate: Joi.boolean().optional(),
    perPage: Joi.number().integer().min(1).optional(),
    page: Joi.number().integer().min(1).optional()
  }),
}
