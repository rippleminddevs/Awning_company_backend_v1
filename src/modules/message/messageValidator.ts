import Joi from 'joi'

export const MessageValidator = {
  create: Joi.object({
    userId: Joi.string()
      .pattern(/^[0-9a-fA-F]{24}$/)
      .optional()
      .messages({
        'string.pattern.base': 'Invalid userId format',
      }),
    chatId: Joi.string()
      .pattern(/^[0-9a-fA-F]{24}$/)
      .optional()
      .messages({
        'string.pattern.base': 'Invalid chatId format',
      }),
    content: Joi.string().allow(null, ''),
    content_type: Joi.string().valid('text', 'media').optional().messages({
      'any.only': 'content_type must be either "text" or "media"',
    }).default('text'),
  }),

  getAll: Joi.object({
    paginate: Joi.boolean().optional(),
    perPage: Joi.number().integer().min(1).optional(),
    page: Joi.number().integer().min(1).optional(),
    chatId: Joi.string().optional()
  }),
  getById: Joi.object({
    id: Joi.string()
      .pattern(/^[0-9a-fA-F]{24}$/)
      .required()
      .messages({
        'string.pattern.base': 'Invalid message id format',
      }),
  }),
  update: Joi.object({
    id: Joi.string()
      .pattern(/^[0-9a-fA-F]{24}$/)
      .required()
      .messages({
        'string.pattern.base': 'Invalid message id format',
      }),
  }),
  delete: Joi.object({
    id: Joi.string()
      .pattern(/^[0-9a-fA-F]{24}$/)
      .required()
      .messages({
        'string.pattern.base': 'Invalid message id format',
      }),
  }),
}
