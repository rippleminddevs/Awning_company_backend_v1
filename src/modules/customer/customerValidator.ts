import Joi from 'joi'

export const CustomerValidator = {
  create: Joi.object({
    customer_type: Joi.string()
      .valid('residential', 'commercial', 'contractor', 'designer', 'property_manager', 'hoa')
      .required(),
    name: Joi.string().required(),
    firstName: Joi.string().optional().allow(null).default(null),
    lastName: Joi.string().optional().allow(null).default(null),
    emailAddress: Joi.string().email().required(),
    businessName: Joi.string().optional().allow(null).default(null),
    companyContact: Joi.string().optional().allow(null).default(null),
    onsiteContact: Joi.string().optional().allow(null).default(null),
    phone: Joi.string().optional().allow(null).default(null),
    addressLine1: Joi.string().required(),
    addressLine2: Joi.string().optional().allow(null).default(null),
    city: Joi.string().required(),
    zipCode: Joi.string().required(),
    notes: Joi.string().optional().allow(null).default(null),
    serviceRequested: Joi.string().optional().allow(null).default(null),
    source: Joi.string().optional().allow(null).default(null),
    crmStatus: Joi.string()
      .valid('active_lead', 'quoted', 'sold', 'follow_up', 'dead', 'installed')
      .default('active_lead'),
    createdBy: Joi.string().required(),
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

  getAll: Joi.object({
    paginate: Joi.boolean().optional(),
    page: Joi.number().optional(),
    perPage: Joi.number().optional(),
    search: Joi.string().optional(),
    dateFilter: Joi.string().valid('MTD', 'YTD').optional(),
  }),

  getSalesRepCustomers: Joi.object({
    paginate: Joi.boolean().optional(),
    page: Joi.number().optional(),
    perPage: Joi.number().optional(),
    search: Joi.string().optional(),
    dateFilter: Joi.string().valid('MTD', 'YTD').optional(),
  }),
}
