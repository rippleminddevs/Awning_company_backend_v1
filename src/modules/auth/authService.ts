import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import {
  UserCredentials,
  AuthTokenPayload,
  AuthResponse,
  SocialLoginPayload,
  ResetTokenData,
  ResetPasswordRequest,
  ResetPasswordConfirm,
  OtpData,
  changePassword
} from './authInterface'
import { AppError } from '../../common/utils/appError'
import { BaseService } from '../../common/core/baseService'
import { User } from '../user/userInterface'
import { UserModel } from '../user/userModel'
import socialLoginService from '../../services/socialLoginService'
import { config } from '../../services/configService'
import { EmailService } from '../../services/emailService'
import crypto from 'crypto'
import { UploadService } from '../upload/uploadService'
import { LocationService } from '../../services/locationService'
import axios from 'axios'

export class AuthService extends BaseService<User> {

  private otpCache: { [email: string]: OtpData } = {}
  private OTP_EXPIRY_MS = 5 * 60 * 1000
  private resetTokens: { [key: string]: ResetTokenData } = {};
  private RESET_TOKEN_EXPIRY = 30 * 60 * 1000;
  private uploadService = new UploadService();
  private locationService = new LocationService();

  constructor() {
    super(UserModel.getInstance())
    this.uploadService = new UploadService();
    this.locationService = new LocationService();
  }

  public register = async (credentials: UserCredentials): Promise<AuthResponse> => {
    const { name, email, password, location } = credentials

    const existingUser = await this.model.getOne({ email })
    if (existingUser) {
      throw AppError.badRequest('User already exists with this email')
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    // create default avatar
    const defaultAvatar = await this.uploadService.createDefaultAvatar();
    const profilePicture = defaultAvatar._id;

    if (location?.latitude && location?.longitude) {
      try {
        const address = await this.locationService.getFullAddress(location.latitude, location.longitude);
        location.address = address || '';
      } catch (error: any) {
        throw AppError.badRequest(error.message);
      }
    }

    const newUser: User = await this.model.create({ name, email, password: hashedPassword, location, profilePicture })
    const token = this.generateToken({ id: newUser._id, email: newUser.email })

    // Send OTP to email
    let otp = await this.sendOTP({ email })

    // Generate URL for default profile picture
    const baseUrl = config.app.url;
    const defaultProfilePicturePath = "/static/uploads/defaults/default_avatar.png";
    const profilePictureUrl = `${baseUrl}${defaultProfilePicturePath}`;
    const userResponse = {
      ...newUser,
      profilePicture: profilePictureUrl
    };

    delete userResponse.password
    return { otp, token, user: userResponse }
  }

  public login = async (credentials: UserCredentials): Promise<AuthResponse> => {
    const { email, password } = credentials

    const user: User = await this.model.getMongooseModel().findOne({
      email: { $regex: new RegExp(`^${email}$`, 'i') }
    })
    if (!user || !user.password) {
      throw AppError.unauthorized('Invalid credentials')
    }

    const userObj = {
      ...(user as any).toObject(),
      password: undefined
    }

    if (user.profilePicture) {
      const profilePicture = await this.uploadService.getById(user.profilePicture);
      userObj.profilePicture = profilePicture.url || null;
    }


    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      throw AppError.unauthorized('Invalid credentials')
    }
    const token = this.generateToken({ id: user._id, email: user.email })
    return { token, user: userObj }
  }

  public googleLogin = async (credentials: SocialLoginPayload): Promise<AuthResponse> => {
    const { idToken } = credentials
    if (!idToken) {
      throw new AppError('ID token is required', 400, 'BAD_REQUEST')
    }

    const payload = await socialLoginService.verifyGoogleToken(idToken)
    if (!payload) {
      throw new AppError('Invalid ID token', 400, 'BAD_REQUEST')
    }

    let user: User = await this.model.getOne({ email: payload.email })
    const userId = user?._id;
    if (!user) {

      // Fetch profile picture
      let profilePictureRef = null;

      if (payload.picture) {
        try {
          const response = await axios.get(payload.picture, { responseType: 'arraybuffer' });
          const buffer = Buffer.from(response.data, 'binary');

          const contentType = response.headers['content-type'] || 'image/jpeg';

          const file = {
            originalname: 'profile.jpg',
            buffer: buffer,
            mimetype: contentType,
            size: buffer.length
          };

          profilePictureRef = await this.uploadService.create({
            file: file,
            userId: userId
          });
        } catch (error) {
          console.error('Error processing profile picture:', error);
        }
      }

      // Generate random password
      const hashedPassword = await this.generateRandomPassword();

      user = await this.model.create({
        name: payload.name,
        email: payload.email,
        googleId: payload.sub,
        password: hashedPassword,
        profilePicture: profilePictureRef?._id,
      })
    }

    const token = this.generateToken({ id: user._id, email: user.email })
    delete user.password
    return { token, user }
  }

  public facebookLogin = async (credentials: SocialLoginPayload): Promise<AuthResponse> => {
    const { accessToken } = credentials
    if (!accessToken) {
      throw new AppError('Access token is required', 400, 'BAD_REQUEST')
    }

    const payload = await socialLoginService.verifyFacebookToken(accessToken)
    if (!payload) {
      throw new AppError('Invalid access token', 400, 'BAD_REQUEST')
    }

    let user: User = await this.model.getOne({ email: payload.email })
    const userId = user?._id;
    if (!user) {

      // Fetch profile picture
      let profilePictureRef = null;

      if (payload.picture?.data?.url) {
        try {
          const response = await axios.get(payload.picture.data.url, { responseType: 'arraybuffer' });
          const buffer = Buffer.from(response.data, 'binary');
          const contentType = response.headers['content-type'] || 'image/jpeg';

          const file = {
            originalname: 'profile.jpg',
            buffer: buffer,
            mimetype: contentType,
            size: buffer.length
          };

          profilePictureRef = await this.uploadService.create({
            file: file,
            userId: userId
          });
        } catch (error) {
          console.error('Error processing Facebook profile picture:', error);
        }
      }

      // Generate random password
      const hashedPassword = await this.generateRandomPassword();

      user = await this.model.create({
        name: payload.name,
        email: payload.email,
        facebookId: payload.id,
        password: hashedPassword,
        profilePicture: profilePictureRef?._id,
      })
    }

    const token = this.generateToken({ id: user._id, email: user.email })
    delete user.password
    return { token, user }
  }

  public resendOtp = async (data: { email: string }): Promise<{ otp: string }> => {
    const { email } = data;
    const existingUser = await this.model.getOne({ email })
    if (!existingUser) {
      throw AppError.badRequest('This email does not exists')
    }

    let otp = await this.sendOTP({ email })
    return { otp }
  }

  protected generateToken = (payload: AuthTokenPayload): string => {
    return jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.accessTokenExpiry,
    })
  }

  public async sendOTP(otpData: OtpData): Promise<string> {
    const { email } = otpData;
    const emailService = new EmailService()

    if (!email) throw AppError.badRequest('Email is required')

    // Generate OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString()

    const expiresAt = Date.now() + this.OTP_EXPIRY_MS
    this.otpCache[email] = {
      email,
      otp,
      expiresAt,
    }

    // Send OTP email
    await emailService.sendOtpEmail(email, otp)
    return otp;
  }

  public async verifyOTP(payload: OtpData): Promise<{ message: string }> {
    const { email, otp } = payload;

    if (!email || !otp) {
      throw AppError.badRequest('Email and OTP are required')
    }

    const cachedOTP = this.otpCache[email];

    if (!cachedOTP) {
      throw AppError.badRequest('No OTP found for this email')
    }

    if (Date.now() > (cachedOTP.expiresAt || 0)) {
      delete this.otpCache[email];
      throw AppError.badRequest('OTP has expired');
    }

    if (cachedOTP.otp !== otp) {
      throw AppError.badRequest('Invalid OTP');
    }

    // Remove used OTP
    delete this.otpCache[email];

    // Get user and update isVerified status
    const user = await this.model.getOne({ email });
    if (user) {
      await this.model.update(user._id, { isVerified: true });
    }

    return { message: 'OTP verified successfully' };
  }

  public requestPasswordReset = async (data: ResetPasswordRequest): Promise<{ message: string }> => {
    const { email } = data;
    const user = await this.model.getOne({ email });
    if (!user) {
      throw AppError.notFound('No user found with this email');
    }

    const resetToken = crypto.randomBytes(32).toString('hex');

    this.resetTokens[resetToken] = {
      email: user.email,
      expiry: Date.now() + this.RESET_TOKEN_EXPIRY
    };

    const resetLink = `${config.app.url}/auth/reset-password?token=${resetToken}`;

    const emailService = new EmailService();
    await emailService.sendPasswordResetEmail(user.email, resetLink);
    return { message: 'Password reset link sent to your email' };
  }

  public resetPassword = async (data: ResetPasswordConfirm): Promise<{ message: string }> => {
    const { token, newPassword } = data;

    const resetData = this.resetTokens[token];
    if (!resetData) {
      throw AppError.badRequest('Invalid or expired reset token');
    }

    if (Date.now() > resetData.expiry) {
      delete this.resetTokens[token];
      throw AppError.badRequest('Reset token has expired');
    }

    const user = await this.model.getOne({ email: resetData.email });
    if (!user) {
      throw AppError.notFound('User not found');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.model.update(user._id, { password: hashedPassword });

    delete this.resetTokens[token];

    return { message: 'Password reset successfully' };

  }

  public changePassword = async (data: changePassword, userId: string): Promise<{ message: string }> => {
    const { oldPassword, newPassword } = data;
    const user = await this.model.getOne({ _id: userId });
    if (!user) {
      throw AppError.notFound('User not found');
    }

    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordValid) {
      throw AppError.badRequest('Invalid old password');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.model.update(user._id, { password: hashedPassword });
    return { message: 'Password changed successfully' };
  }

  public async generateRandomPassword(): Promise<string> {
    const rawPassword = crypto.randomBytes(12).toString('hex'); // 24-char
    const hashedPassword = await bcrypt.hash(rawPassword, 10);
    return hashedPassword;
  };
}
