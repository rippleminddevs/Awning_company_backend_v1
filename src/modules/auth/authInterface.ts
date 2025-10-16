import { Location } from "../user/userInterface"

export interface UserCredentials {
  name?: string
  email: string
  password: string
  location: Location
  profilePicture?: string
  phoneNumber?: string
}

export interface AuthTokenPayload {
  id: string
  email: string
}

export interface AuthResponse {
  otp?: string
  token: string
  user: {
    _id: string,
    name: string,
    email: string,
    location?: Location
    profilePicture?: string
    phoneNumber?: string
    isVerified?: boolean
  }
}

export interface SocialLoginPayload {
  idToken?: string
  accessToken?: string
}

export interface ResetTokenData {
  email: string;
  expiry: number;
}

export interface ResetPasswordRequest {
  email: string;
}

export interface ResetPasswordConfirm {
  token: string;
  newPassword: string;
}

export interface OtpData {
  email: string;
  otp?: string;
  expiresAt?: number;
}

export interface changePassword {
  oldPassword: string;
  newPassword: string;
}