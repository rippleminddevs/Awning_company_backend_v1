import Joi from 'joi'

export const NotificationValidator = {
  create: Joi.object({
    type: Joi.string().required(),
    refType: Joi.string().required(),
    refId: Joi.string().required(),
    targets: Joi.array().required(),
    data: Joi.object().optional(),
    sendPush: Joi.boolean().optional(),
  }),

  update: Joi.object({
    type: Joi.string().optional(),
    refType: Joi.string().optional(),
    refId: Joi.string().optional(),
    targets: Joi.array().optional(),
    readBy: Joi.array().optional(),
    data: Joi.object().optional(),
    createdBy: Joi.string().optional(),
  }),

  getAll: Joi.object({
    paginate: Joi.boolean().optional(),
    page: Joi.number().optional(),
    perPage: Joi.number().optional(),
    search: Joi.string().optional(),
  }),

  markAsRead: Joi.object({
    notificationId: Joi.string().required(),
    userId: Joi.string().required(),
  }),
}
