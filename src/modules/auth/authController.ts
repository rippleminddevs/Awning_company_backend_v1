import { Request, Response } from 'express'
import { BaseController } from '../../common/core/baseController'
import { AuthService } from './authService'
import { SocialLoginPayload, UserCredentials, ResetPasswordConfirm, ResetPasswordRequest, OtpData, changePassword } from './authInterface'
import { apiResponse } from '../../common/utils/apiResponse'
import { User } from '../user/userInterface'
import { UserService } from '../user/userService'

export class AuthController extends BaseController<User, AuthService> {
  private userService: UserService
  constructor(authService: AuthService, userService: UserService) {
    super(authService)
    this.userService = userService
  }

  public register = async (req: Request, res: Response): Promise<void> => {
    const credentials: UserCredentials = req.body
    const authResponse = await this.service.register(credentials)
    apiResponse(res, authResponse, 201, "User registered successfully")
  }

  public login = async (req: Request, res: Response): Promise<void> => {
    const credentials: UserCredentials = req.body
    const authResponse = await this.service.login(credentials)
    apiResponse(res, authResponse, 200, "User logged in successfully")
  }

  public googleLogin = async (req: Request, res: Response): Promise<void> => {
    const data: Partial<SocialLoginPayload> = req.body
    const authResponse = await this.service.googleLogin(data)
    apiResponse(res, authResponse, 200, "User logged in successfully")
  }

  public facebookLogin = async (req: Request, res: Response): Promise<void> => {
    const data: Partial<SocialLoginPayload> = req.body
    const authResponse = await this.service.facebookLogin(data)
    apiResponse(res, authResponse, 200, "User logged in successfully")
  }

  public requestPasswordReset = async (req: Request, res: Response): Promise<void> => {
    const data: ResetPasswordRequest = req.body;
    const requestResponse = await this.service.requestPasswordReset(data);
    apiResponse(res, requestResponse, 200, "Password reset request sent successfully");
  }

  public resetPassword = async (req: Request, res: Response): Promise<void> => {
    const data: ResetPasswordConfirm = req.body;
    const resetResponse = await this.service.resetPassword(data);
    apiResponse(res, resetResponse, 200, "Password reset successfully");
  }

  public verifyOTP = async (req: Request, res: Response): Promise<void> => {
    const data: OtpData = req.body
    const otpResponse = await this.service.verifyOTP(data)
    apiResponse(res, otpResponse, 200, "OTP verified successfully")
  }

  public resendOtp = async (req: Request, res: Response): Promise<void> => {
    const data: OtpData = req.body
    const otpResponse = await this.service.resendOtp(data)
    apiResponse(res, otpResponse, 200, "OTP resent successfully")
  }

  public changePassword = async (req: Request, res: Response): Promise<void> => {
    const data: changePassword = req.body;
    const changeResponse = await this.service.changePassword(data, req.user?.id);
    apiResponse(res, changeResponse, 200, "Password changed successfully");
  }
}
