import express, { Request, Response } from 'express'
import { AuthController } from './authController'
import { authenticate } from '../../middlewares/authMiddleware'
import { AuthValidator } from './authValidator'
import { validate } from '../../common/utils/helpers'
import { AuthService } from './authService'
import { UserService } from '../user/userService'

const router = express.Router()

const authService = new AuthService()
const userService = new UserService()
const authController = new AuthController(authService, userService)

router.post('/register', validate(AuthValidator.register), authController.register)
router.post('/login', validate(AuthValidator.login), authController.login)
router.post('/google', validate(AuthValidator.googleLogin), authController.googleLogin)
router.post('/facebook', validate(AuthValidator.facebookLogin), authController.facebookLogin)
router.post('/forgot-password', validate(AuthValidator.resetPasswordRequest), authController.requestPasswordReset)
router.post('/reset-password', validate(AuthValidator.resetPasswordConfirm), authController.resetPassword)
router.post('/verify-otp', validate(AuthValidator.verifyOTP), authController.verifyOTP)
router.post('/resend-otp', validate(AuthValidator.resendOtp), authController.resendOtp)

router.use(authenticate)
router.post('/change-password', validate(AuthValidator.changePassword), authController.changePassword)

export default router
