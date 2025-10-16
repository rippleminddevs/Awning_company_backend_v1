import Joi from 'joi'

export const SaleValidator = {
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

  getSalesOverview: Joi.object({
    sortCounts: Joi.string().optional().valid('daily','weekly', 'monthly', 'yearly'),
    sortSalesAnalytics: Joi.string().optional().valid('daily','weekly', 'monthly', 'yearly'),
    sortOrderStats: Joi.string().optional().valid('daily','weekly', 'monthly', 'yearly'),
  }),

  getSalesRepresentatives: Joi.object({
    search: Joi.string().optional(),
    paginate: Joi.boolean().optional().default(false),
    page: Joi.number().optional().default(1),
    perPage: Joi.number().optional().default(10),
    duration: Joi.string().optional().valid('daily','weekly', 'monthly', 'yearly'),
  }),

  getCurrentOrders: Joi.object({
    paginate: Joi.boolean().optional().default(false),
    page: Joi.number().optional().default(1),
    perPage: Joi.number().optional().default(10),
  }),

  getSalesReport: Joi.object({
    sortCounts: Joi.string().optional().valid('daily','weekly', 'monthly', 'yearly'),
    sortSalesAnalytics: Joi.string().optional().valid('daily','weekly', 'monthly', 'yearly'),
    sortOrderStats: Joi.string().optional().valid('daily','weekly', 'monthly', 'yearly'),
    paginate: Joi.boolean().optional().default(false),
    page: Joi.number().optional().default(1),
    perPage: Joi.number().optional().default(10),
  }),

  getDashboardAnalytics: Joi.object({
    sortCounts: Joi.string().optional().valid('daily','weekly', 'monthly', 'yearly'),
    sortSalesAnalytics: Joi.string().optional().valid('daily','weekly', 'monthly', 'yearly'),
    sortOrderStats: Joi.string().optional().valid('daily','weekly', 'monthly', 'yearly'),
  }),
}
