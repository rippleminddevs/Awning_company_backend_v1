import Joi from 'joi'

export const QuoteValidator = {
  create: Joi.object({
    appointmentId: Joi.string().required(),
    paymentStructure: Joi.object().required(),
    paymentDetails: Joi.object().required(),
    paymentSummary: Joi.object().optional(),
    items: Joi.array()
      .items(
        Joi.object({
          unitPrice: Joi.number().optional(),
        }).unknown(true)
      )
      .required(),
    status: Joi.string()
      .valid(
        'Hot',
        'Warm',
        'Dead',
        'SOLD',
        'CALL BACK',
        'LEFT PHONE MESSAGE',
        'QUOTED',
        'CANCELLED',
        'NO SHOW',
        'FOLLOWED UP',
        'UNAVAILABLE',
        'CONFIRMED',
        'NO CAN DO',
        'AWAITING QUOTE',
        'SALE PENDING',
        'TENTATIVE APT',
        'SCHEDULED',
        'LEFT VOICEMAIL',
        'COMPLETE',
        'NEW LEADS',
        'COMING TO SHOWROOM'
      )
      .optional()
      .default('Hot'),
    paymentStatus: Joi.string()
      .valid('pending', 'paid', 'partially paid')
      .optional()
      .default('pending'),
    line_items_v2: Joi.array().items(Joi.object().unknown(true)).optional(),
    quote_notes: Joi.string().optional().allow(''),
  }),

  update: Joi.object({
    appointmentId: Joi.string().optional(),
    paymentStructure: Joi.object().optional(),
    paymentDetails: Joi.object().optional(),
    paymentSummary: Joi.object().optional(),
    items: Joi.array().items(Joi.object()).optional(),
    invoice: Joi.string().optional(),
    documents: Joi.array().items(Joi.string()).optional(),
    status: Joi.string()
      .valid(
        'Hot',
        'Warm',
        'Dead',
        'SOLD',
        'CALL BACK',
        'LEFT PHONE MESSAGE',
        'QUOTED',
        'CANCELLED',
        'NO SHOW',
        'FOLLOWED UP',
        'UNAVAILABLE',
        'CONFIRMED',
        'NO CAN DO',
        'AWAITING QUOTE',
        'SALE PENDING',
        'TENTATIVE APT',
        'SCHEDULED',
        'LEFT VOICEMAIL',
        'COMPLETE',
        'NEW LEADS',
        'COMING TO SHOWROOM'
      )
      .optional()
      .default('Hot'),
    paymentStatus: Joi.string().valid('pending', 'paid', 'partially paid').optional(),
    line_items_v2: Joi.array().items(Joi.object().unknown(true)).optional(),
    quote_notes: Joi.string().optional().allow(''),
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
    source: Joi.string().optional(),
    status: Joi.string()
      .valid(
        'Hot',
        'Warm',
        'Dead',
        'SOLD',
        'CALL BACK',
        'LEFT PHONE MESSAGE',
        'QUOTED',
        'CANCELLED',
        'NO SHOW',
        'FOLLOWED UP',
        'UNAVAILABLE',
        'CONFIRMED',
        'NO CAN DO',
        'AWAITING QUOTE',
        'SALE PENDING',
        'TENTATIVE APT',
        'SCHEDULED',
        'LEFT VOICEMAIL',
        'COMPLETE',
        'NEW LEADS',
        'COMING TO SHOWROOM'
      )
      .optional(),
    dateFilter: Joi.string().valid('MTD', 'YTD').optional(),
    sort: Joi.string().optional(),
  }),

  getTransactions: Joi.object({
    paginate: Joi.boolean().optional(),
    page: Joi.number().optional(),
    perPage: Joi.number().optional(),
    search: Joi.string().optional(),
    status: Joi.string().optional(),
  }),

  updatePaymentStatus: Joi.object({
    paymentStatus: Joi.string().valid('pending', 'paid', 'partially paid', 'failed').required(),
  }),
}
