import Joi from 'joi';

const baseAppointmentSchema = {
  // Common fields for all customer types
  customerType: Joi.string().required().valid('residential', 'commercial', 'contractor'),
  firstName: Joi.string().when('customerType', {
    is: 'residential',
    then: Joi.required(),
    otherwise: Joi.optional().allow('', null)
  }),
  lastName: Joi.string().when('customerType', {
    is: 'residential',
    then: Joi.required(),
    otherwise: Joi.optional().allow('', null)
  }),
  businessName: Joi.string().when('customerType', {
    is: Joi.valid('commercial', 'contractor'),
    then: Joi.required(),
    otherwise: Joi.optional().allow('', null)
  }),
  billAddress: Joi.string().when('customerType', {
    is: Joi.valid('commercial', 'contractor'),
    then: Joi.required(),
    otherwise: Joi.optional().allow('', null)
  }),
  projectManagerContact: Joi.string().when('customerType', {
    is: Joi.valid('commercial', 'contractor'),
    then: Joi.required(),
    otherwise: Joi.optional().allow('', null)
  }),
  companyContact: Joi.string().when('customerType', {
    is: Joi.valid('commercial', 'contractor'),
    then: Joi.required(),
    otherwise: Joi.optional().allow('', null)
  }),
  source: Joi.string().when('customerType', {
    is: Joi.valid('commercial', 'contractor'),
    then: Joi.required(),
    otherwise: Joi.optional().allow('', null)
  }),
  // Rest of the common fields
  emailAddress: Joi.string().required(),
  address1: Joi.string().required(),
  address2: Joi.string().optional().allow('', null),
  city: Joi.string().required(),
  zipCode: Joi.string().required(),
  bestContact: Joi.string().required(),
  customerNotes: Joi.string().optional().allow('', null),
  service: Joi.string().required(),
  staff: Joi.string().required(),
  date: Joi.date().required(),
  time: Joi.date().required(),
  duration: Joi.string().required(),
  status: Joi.string().required(),
  internalNotes: Joi.string().optional().allow('', null),
  phoneNumber: Joi.string().optional().allow('', null),
  notifications: Joi.object({
    emailToCustomer: Joi.boolean().default(false),
    emailToManager: Joi.boolean().default(false),
    textMessages: Joi.boolean().default(false),
  }).optional().default(null)
};

export const AppointmentValidator = {
  create: Joi.object(baseAppointmentSchema),

  update: Joi.object({
    ...baseAppointmentSchema,
    customerType: Joi.string().valid('residential', 'commercial', 'contractor'),
    emailAddress: Joi.string(),
    address1: Joi.string(),
    city: Joi.string(),
    zipCode: Joi.string(),
    bestContact: Joi.string(),
    service: Joi.string(),
    staff: Joi.string(),
    date: Joi.date(),
    time: Joi.date(),
    duration: Joi.string(),
    status: Joi.string(),
  }).min(1),

  getAll: Joi.object({
    paginate: Joi.boolean().default(true),
    page: Joi.number().min(1).default(1),
    perPage: Joi.number().min(1).default(10),
    search: Joi.string().allow(''),
    today: Joi.boolean().default(false),
    dateFilter: Joi.string().allow(''),
    customerType: Joi.string().valid('residential', 'commercial', 'contractor'),
    staff: Joi.string()
  })
};