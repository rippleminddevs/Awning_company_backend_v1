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
    role: Joi.string().valid('salesperson', 'manager', 'superadmin').default('salesperson').optional(),
    isAdmin: Joi.boolean().optional().default(false),
    isVerified: Joi.boolean().optional().default(false),
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
    isAdmin: Joi.boolean().optional()
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
    role: Joi.string().valid('salesperson', 'manager', 'superadmin').default('salesperson')
  }),

  updateFCMTokens: Joi.object({
    addfcmToken: Joi.string().optional(),
    removefcmToken: Joi.string().optional(),
  }),

  getSalesPersons: Joi.object({
    search: Joi.string().optional(),
    paginate: Joi.boolean().optional().default(false),
    page: Joi.number().optional().default(1),
    perPage: Joi.number().optional().default(10),
    duration: Joi.string().optional().valid('daily','weekly', 'monthly', 'yearly'),
  }),

}