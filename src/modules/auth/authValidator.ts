import Joi from 'joi'

export const AuthValidator = {
  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),
  register: Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    location: Joi.object({
      address: Joi.string().optional(),
      latitude: Joi.number().required(),
      longitude: Joi.number().required(),
    }).optional(),
    role: Joi.string().valid('salesperson', 'manager', 'superadmin').default('salesperson').optional(),
    isAdmin: Joi.boolean().optional(),
    isVerified: Joi.boolean().optional().default(false),
  }),
  googleLogin: Joi.object({
    idToken: Joi.string().required(),
  }),
  facebookLogin: Joi.object({
    accessToken: Joi.string().required(),
  }),
  resetPasswordRequest: Joi.object({
    email: Joi.string().email().required()
  }),
  resetPasswordConfirm: Joi.object({
    token: Joi.string().required(),
    newPassword: Joi.string().min(6).required()
  }),
  verifyOTP: Joi.object({
    email: Joi.string().email().required(),
    otp: Joi.string().required()
  }),
  resendOtp: Joi.object({
    email: Joi.string().email().required(),
  }),
  changePassword: Joi.object({
    oldPassword: Joi.string().required(),
    newPassword: Joi.string().min(6).required()
  })
}
