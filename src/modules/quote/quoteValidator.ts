import Joi from 'joi'

export const QuoteValidator = {
  create: Joi.object({
    appointmentId: Joi.string().required(),
    paymentStructure: Joi.object().required(),
    paymentDetails: Joi.object().required(),
    paymentSummary: Joi.object().optional(),
    items: Joi.array().items(Joi.object()).required(),
    status: Joi.string().valid('Hot', 'Warm', 'Dead').optional().default('Hot'),
    paymentStatus: Joi.string().valid('pending', 'paid', 'partially paid').optional().default('pending'),
  }),

  update: Joi.object({
    appointmentId: Joi.string().optional(),
    paymentStructure: Joi.object().optional(),
    paymentDetails: Joi.object().optional(),
    paymentSummary: Joi.object().optional(),
    items: Joi.array().items(Joi.object()).optional(),
    invoice: Joi.string().optional(),
    documents: Joi.array().items(Joi.string()).optional(),
    status: Joi.string().valid('Hot', 'Warm', 'Dead').optional().default('Hot'),
    paymentStatus: Joi.string().valid('pending', 'paid', 'partially paid').optional(),
  }),

  updateDocuments: Joi.object({
    addDocuments: Joi.array().items(Joi.object().required()).max(10).optional(),
    removeDocuments: Joi.array().items(Joi.string()).optional(),
  }),

  getAll: Joi.object({
    paginate: Joi.boolean().optional(),
    page: Joi.number().optional(),
    perPage: Joi.number().optional(),
    search: Joi.string().optional(),
    sort: Joi.string().optional().valid('Hot', 'Warm', 'Dead', 'hot', 'warm', 'dead'),
    source: Joi.string().optional(),
    status: Joi.string().optional(),
  })
}
