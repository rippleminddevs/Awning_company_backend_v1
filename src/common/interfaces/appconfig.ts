interface AppConfig {
  name: string
  port: number
  url: string
  version: string
  corsOrigin: string
}

interface MongoDBConfig {
  host: string
  port: number
  username: string
  password: string
  database: string
  atlas: boolean
}

interface MySQLConfig {
  host: string
  port: number
  username: string
  password: string
  database: string
}

export interface DatabaseConfig {
  connection: string
  mongodb: MongoDBConfig
  mysql: MySQLConfig
}

interface JWTConfig {
  secret: string
  accessTokenExpiry: number
  refreshTokenExpiry: number
}

interface EmailConfig {
  host: string
  port: number
  username: string
  password: string
  fromAddress: string
  secure: boolean
}

interface StripeConfig {
  publicKey: string
  secretKey: string
  webhookSecret: string
}

interface PayPalConfig {
  baseUrl: string
  clientId: string
  secret: string
  sandbox: boolean
}

interface PaymentConfig {
  stripe: StripeConfig
  paypal: PayPalConfig
}

interface GoogleConfig {
  clientID: string
  clientSecret: string
}

interface FacebookConfig {
  clientID: string
  clientSecret: string
}

interface SocialLoginConfig {
  google: GoogleConfig
  facebook: FacebookConfig
}

interface CloudinaryConfig {
  cloudName: string
  apiKey: string
  apiSecret: string
}

interface AwsConfig {
  accessKeyId: string
  secretAccessKey: string
  region: string
  bucketName: string
}

interface UploadConfig {
  uploadType: 'local' | 'cloudinary' | 's3'
  uploadDir: string
  cloudinary: CloudinaryConfig
  aws: AwsConfig
}

interface geoLocationConfig {
  apiKey: string;
  baseUrl: string;
}

interface LocationConfig {
  google: geoLocationConfig
}

export interface EnvConfig {
  location: LocationConfig
  app: AppConfig
  database: DatabaseConfig
  jwt: JWTConfig
  email: EmailConfig
  payment: PaymentConfig
  socialLogin: SocialLoginConfig
  upload: UploadConfig
}
