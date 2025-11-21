import Joi from 'joi'

export const UserValidator = {
  create: Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).optional(),
    phoneNumber: Joi.string().optional(),
    location: Joi.object({
      address: Joi.string().optional(),
      latitude: Joi.number().required(),
      longitude: Joi.number().required(),
    }).optional(),
    role: Joi.string()
      .valid('salesperson', 'manager', 'superadmin')
      .default('salesperson')
      .optional(),
    isAdmin: Joi.boolean().optional().default(false),
    isVerified: Joi.boolean().optional().default(false),
    city: Joi.string().optional(),
    zipCode: Joi.string().optional(),
  }),

  updateUsers: Joi.object({
    name: Joi.string().optional(),
    email: Joi.string().email().optional(),
    phoneNumber: Joi.string().optional(),
    profilePicture: Joi.string().optional(),
    location: Joi.object({
      address: Joi.string().optional(),
      latitude: Joi.number().required(),
      longitude: Joi.number().required(),
    }).optional(),
    role: Joi.string().valid('salesperson', 'manager', 'superadmin').default('salesperson'),
    isAdmin: Joi.boolean().optional(),
    city: Joi.string().optional(),
    zipCode: Joi.string().optional(),
  }),

  updateOwnProfile: Joi.object({
    name: Joi.string().optional(),
    email: Joi.string().email().optional(),
    phoneNumber: Joi.string().optional(),
    profilePicture: Joi.string().optional(),
    location: Joi.object({
      address: Joi.string().optional(),
      latitude: Joi.number().required(),
      longitude: Joi.number().required(),
    }).optional(),
    role: Joi.string().valid('salesperson', 'manager', 'superadmin').default('salesperson'),
    city: Joi.string().optional(),
    zipCode: Joi.string().optional(),
  }),

  updateFCMTokens: Joi.object({
    addfcmToken: Joi.string().optional(),
    removefcmToken: Joi.string().optional(),
  }),

  getAll: Joi.object({
    search: Joi.string().optional(),
    city: Joi.string().optional(),
    role: Joi.string().optional(),
    paginate: Joi.boolean().optional().default(true),
    page: Joi.number().optional().default(1),
    perPage: Joi.number().optional().default(10),
  }),

  getSalesPersons: Joi.object({
    search: Joi.string().optional(),
    paginate: Joi.boolean().optional().default(false),
    page: Joi.number().optional().default(1),
    perPage: Joi.number().optional().default(10),
    duration: Joi.string().optional().valid('daily', 'weekly', 'monthly', 'yearly'),
  }),

  getPermissions: Joi.object({
    id: Joi.string().required(),
  }),

  updatePermissions: Joi.object({
    permissions: Joi.object({
      salesTracking: Joi.boolean().optional(),
      orderTracking: Joi.boolean().optional(),
      staffPerformance: Joi.boolean().optional(),
    })
      .unknown(false)
      .optional(),
  }),
}
