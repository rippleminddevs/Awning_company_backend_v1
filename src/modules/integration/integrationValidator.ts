import Joi from 'joi'

export const IntegrationValidator = {
  createSMTP: Joi.object({
    smtp: Joi.object({
      configName: Joi.string().optional().default(null),
      from: Joi.string().optional().default(null),
      host: Joi.string().optional().default(null),
      port: Joi.number().optional().default(null),
      email: Joi.string().email().optional().default(null),
      password: Joi.string().min(6).optional().default(null),
    })
  }),

  createMailChimp: Joi.object({
    mailChimp: Joi.object({
      apiKey: Joi.string().optional().default(null),
    })
  }),

  createThirdPartyTool: Joi.object({
    thirdPartyTool: Joi.array().items(
      Joi.object({
        name: Joi.string().optional().default(null),
        enable: Joi.boolean().optional().default(false),
      })
    )
  }),

  createNotificationSetting: Joi.object({
    notificationSetting: Joi.object({
      reminderAlert: Joi.boolean().optional().default(false),
      paymentAlert: Joi.boolean().optional().default(false),
      inventoryAlert: Joi.boolean().optional().default(false),
    })
  }),

  update: Joi.object({
    smtp: Joi.object({
      configName: Joi.string().optional(),
      from: Joi.string().optional(),
      host: Joi.string().optional(),
      port: Joi.number().optional(),
      email: Joi.string().email().optional(),
      password: Joi.string().min(6).optional(),
    }),
    mailChimp: Joi.object({
      apiKey: Joi.string().optional(),
    }),
    thirdPartyTool: Joi.array().items(
      Joi.object({
        name: Joi.string().optional(),
        enable: Joi.boolean().optional(),
      })
    ),
    notificationSetting: Joi.object({
      reminderAlert: Joi.boolean().optional(),
      paymentAlert: Joi.boolean().optional(),
      inventoryAlert: Joi.boolean().optional(),
    }),
  }),
}
