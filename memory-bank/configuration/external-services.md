# 🔌 External Services Integration Guide

## 🌐 Overview

This guide covers all third-party service integrations in the Awning Company Backend. The application integrates with multiple external services to provide comprehensive business functionality.

---

## 📧 Email Service - Nodemailer

### Service Overview
- **Provider**: SMTP-based email delivery
- **Purpose**: Transactional emails (welcome, password reset, OTP)
- **Technology**: Nodemailer with SMTP transport

### Configuration
```json
{
  "email": {
    "host": "sandbox.smtp.mailtrap.io",
    "port": 2525,
    "username": "your-email-username",
    "password": "your-email-password",
    "fromAddress": "no-reply@awningcompany.com",
    "secure": false
  }
}
```

### Email Templates
The application uses EJS templates for HTML emails:

#### Template Location
```bash
src/views/
├── emails/
│   ├── welcome.ejs
│   ├── password-reset.ejs
│   └── otp.ejs
```

#### Supported Email Types
1. **Welcome Email**: New user registration
2. **Password Reset**: Forgot password flow
3. **OTP Verification**: Email verification

### Usage Example
```typescript
import { EmailService } from '../../services/emailService'

const emailService = new EmailService()
await emailService.sendOtpEmail(user.email, otp)
await emailService.sendPasswordResetEmail(user.email, resetLink)
```

---

## 💳 Payment Services

### 1. Stripe Integration

#### Service Overview
- **Provider**: Stripe Inc.
- **Purpose**: Credit card processing, subscriptions, webhooks
- **Technology**: Stripe Node.js SDK

#### Configuration
```json
{
  "payment": {
    "stripe": {
      "publicKey": "pk_live_...",
      "secretKey": "sk_live_...",
      "webhookSecret": "whsec_..."
    }
  }
}
```

#### Features Implemented
```typescript
// Payment Intent Creation
const paymentIntent = await stripe.paymentIntents.create({
  amount: order.totalAmount * 100, // Convert to cents
  currency: 'usd',
  customer: customerId,
  metadata: { orderId: order._id }
})

// Customer Management
const customer = await stripe.customers.create({
  email: user.email,
  name: user.name,
  metadata: { userId: user._id }
})

// Payment Method Handling
const paymentMethod = await stripe.paymentMethods.attach(paymentMethodId, {
  customer: customerId
})

// Subscription Management
const subscription = await stripe.subscriptions.create({
  customer: customerId,
  items: [{ price: priceId }]
})
```

#### Webhook Events
- `payment_intent.succeeded`
- `payment_intent.payment_failed`
- `invoice.payment_succeeded`
- `customer.subscription.created`

### 2. PayPal Integration

#### Service Overview
- **Provider**: PayPal
- **Purpose**: Alternative payment method
- **Technology**: PayPal REST API

#### Configuration
```json
{
  "payment": {
    "paypal": {
      "baseUrl": "https://api-m.paypal.com",
      "clientId": "your-paypal-client-id",
      "secret": "your-paypal-secret",
      "sandbox": false
    }
  }
}
```

#### Features Implemented
```typescript
// OAuth2 Authentication
const auth = Buffer.from(`${clientId}:${secret}`).toString('base64')
const tokenResponse = await axios.post(`${baseUrl}/v1/oauth2/token`, 
  'grant_type=client_credentials',
  { headers: { Authorization: `Basic ${auth}` } }
)

// Order Creation
const order = await paypal.orders.create({
  intent: 'CAPTURE',
  purchase_units: [{
    amount: { currency_code: 'USD', value: totalAmount },
    reference_id: orderId
  }]
})
```

---

## 🔐 Social Login Services

### 1. Google OAuth 2.0

#### Service Overview
- **Provider**: Google
- **Purpose**: User authentication via Google account
- **Technology**: Google OAuth 2.0 & JWT verification

#### Configuration
```json
{
  "socialLogin": {
    "google": {
      "clientID": "your-google-client-id",
      "clientSecret": "your-google-client-secret"
    }
  }
}
```

#### Implementation Details
```typescript
// Google ID Token Verification
const { OAuth2Client } = require('google-auth-library')
const client = new OAuth2Client(clientId)

async function verifyGoogleToken(idToken: string) {
  const ticket = await client.verifyIdToken({
    idToken,
    audience: clientId
  })
  
  return ticket.getPayload()
}

// User Creation/Login
const payload = await verifyGoogleToken(idToken)
let user = await this.model.getOne({ email: payload.email })

if (!user) {
  // Download profile picture
  const profilePicture = await this.downloadProfilePicture(payload.picture)
  
  user = await this.model.create({
    name: payload.name,
    email: payload.email,
    googleId: payload.sub,
    profilePicture: profilePicture._id
  })
}
```

### 2. Facebook Login

#### Service Overview
- **Provider**: Meta (Facebook)
- **Purpose**: User authentication via Facebook account
- **Technology**: Facebook Graph API

#### Configuration
```json
{
  "socialLogin": {
    "facebook": {
      "clientID": "your-facebook-app-id",
      "clientSecret": "your-facebook-app-secret"
    }
  }
}
```

#### Implementation Details
```typescript
// Facebook Access Token Verification
async function verifyFacebookToken(accessToken: string) {
  const response = await axios.get(
    `https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${accessToken}`
  )
  
  return response.data
}

// Profile Picture Download
const response = await axios.get(picture.data.url, { 
  responseType: 'arraybuffer' 
})
const buffer = Buffer.from(response.data, 'binary')
```

---

## 📍 Location Services

### Google Maps Geocoding API

#### Service Overview
- **Provider**: Google
- **Purpose**: Address resolution from coordinates
- **Technology**: Google Maps Geocoding API

#### Configuration
```json
{
  "location": {
    "google": {
      "apiKey": "your-google-maps-api-key",
      "baseUrl": "https://maps.googleapis.com/maps/api/geocode/json"
    }
  }
}
```

#### Implementation Details
```typescript
class LocationService {
  public async getFullAddress(latitude: number, longitude: number): Promise<string> {
    const response = await axios.get(
      `${this.baseUrl}?latlng=${latitude},${longitude}&key=${this.apiKey}`
    )
    
    if (response.data.status === 'OK') {
      return response.data.results[0].formatted_address
    }
    
    throw new Error('Unable to get address from coordinates')
  }
}

// Usage in User Registration
if (location?.latitude && location?.longitude) {
  const address = await this.locationService.getFullAddress(
    location.latitude, 
    location.longitude
  )
  location.address = address
}
```

---

## 📱 Push Notifications - Firebase Cloud Messaging

### Service Overview
- **Provider**: Google Firebase
- **Purpose**: Real-time push notifications to mobile devices
- **Technology**: Firebase Admin SDK

### Configuration
```json
{
  "firebase": {
    "serviceAccountKey": "path/to/serviceAccountKey.json"
  }
}
```

#### Service Account Setup
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create project or use existing
3. Enable Cloud Messaging
4. Service Accounts → Generate new private key
5. Save as `serviceAccountKey.json`

#### Implementation Details
```typescript
import admin from 'firebase-admin'

// Initialize Firebase
const serviceAccount = require('./serviceAccountKey.json')
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
})

// Send Push Notification
export class PushNotificationService {
  public async sendMulticastNotification(
    tokens: string[],
    notification: { title: string; body: string },
    data?: Record<string, any>
  ): Promise<void> {
    const message: admin.messaging.MulticastMessage = {
      notification,
      data,
      tokens
    }
    
    const response = await admin.messaging().sendMulticast(message)
    console.log(`Successfully sent message: ${response.successCount}/${response.failureCount}`)
  }
}

// Usage Example
await notificationService.sendPushNotification(
  userDeviceTokens,
  {
    title: 'New Appointment',
    body: `You have a new appointment scheduled for ${appointment.date}`
  },
  { appointmentId: appointment._id }
)
```

#### Device Token Management
```typescript
// Update FCM Tokens
export class UserService {
  public async updateFCMTokens(
    userId: string, 
    addToken?: string, 
    removeToken?: string
  ): Promise<void> {
    const user = await this.model.getById(userId)
    let tokens = user.deviceTokens || []
    
    if (addToken && !tokens.includes(addToken)) {
      tokens.push(addToken)
    }
    
    if (removeToken) {
      tokens = tokens.filter(token => token !== removeToken)
    }
    
    await this.model.update(userId, { deviceTokens: tokens })
  }
}
```

---

## ☁️ File Storage Services

### Multi-Storage Architecture
The application supports multiple storage backends that can be configured via environment settings.

### 1. Local Storage

#### Configuration
```json
{
  "upload": {
    "uploadType": "local",
    "uploadDir": "uploads"
  }
}
```

#### Implementation
```typescript
public async create(file: Express.Multer.File): Promise<Upload> {
  const fileName = generateUniqueFileName(file.originalname)
  const filePath = path.join(this.uploadDir, fileName)
  
  // Save file locally
  fs.writeFileSync(filePath, file.buffer)
  
  // Return URL
  const url = `${config.app.url}/static/${fileName}`
  return this.createUploadRecord(file, url, fileName)
}
```

### 2. Cloudinary Integration

#### Service Overview
- **Provider**: Cloudinary
- **Purpose**: Cloud image/video storage and optimization
- **Technology**: Cloudinary Node.js SDK

#### Configuration
```json
{
  "upload": {
    "uploadType": "cloudinary",
    "cloudinary": {
      "cloudName": "your-cloud-name",
      "apiKey": "your-api-key",
      "apiSecret": "your-api-secret"
    }
  }
}
```

#### Implementation Details
```typescript
import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: config.upload.cloudinary.cloudName,
  api_key: config.upload.cloudinary.apiKey,
  api_secret: config.upload.cloudinary.apiSecret
})

export class UploadService {
  public async uploadToCloudinary(
    file: Express.Multer.File
  ): Promise<{ url: string; publicId: string }> {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: this.getResourceType(file.mimetype),
          folder: 'awning-company',
          public_id: generateUniqueFileName(file.originalname)
        },
        (error, result) => {
          if (error) reject(error)
          else resolve({
            url: result.secure_url,
            publicId: result.public_id
          })
        }
      ).end(file.buffer)
    })
  }
}
```

### 3. AWS S3 Integration

#### Service Overview
- **Provider**: Amazon Web Services
- **Purpose**: Object storage for files and media
- **Technology**: AWS SDK v3

#### Configuration
```json
{
  "upload": {
    "uploadType": "aws",
    "aws": {
      "accessKeyId": "your-access-key-id",
      "secretAccessKey": "your-secret-access-key",
      "region": "us-east-1",
      "bucketName": "your-bucket-name"
    }
  }
}
```

#### Implementation Details
```typescript
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'

const s3Client = new S3Client({
  region: config.upload.aws.region,
  credentials: {
    accessKeyId: config.upload.aws.accessKeyId,
    secretAccessKey: config.upload.aws.secretAccessKey
  }
})

export class UploadService {
  public async uploadToS3(
    file: Express.Multer.File
  ): Promise<{ url: string; key: string }> {
    const key = `uploads/${generateUniqueFileName(file.originalname)}`
    
    const command = new PutObjectCommand({
      Bucket: config.upload.aws.bucketName,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: 'public-read'
    })
    
    await s3Client.send(command)
    
    const url = `https://${config.upload.aws.bucketName}.s3.${config.upload.aws.region}.amazonaws.com/${key}`
    return { url, key }
  }
}
```

---

## 🔄 Real-time Communication - Socket.IO

### Service Overview
- **Technology**: Socket.IO
- **Purpose**: Real-time bidirectional communication
- **Features**: Chat, notifications, live updates

### Configuration
```typescript
// src/services/socketService.ts
import { Server } from 'socket.io'
import { AppError } from '../common/utils/appError'

class SocketService {
  private io: Server
  
  public initialize(server: any): void {
    this.io = new Server(server, {
      cors: {
        origin: config.app.corsOrigin,
        methods: ['GET', 'POST']
      }
    })
    
    this.setupMiddleware()
    this.setupEventHandlers()
  }
  
  private setupMiddleware(): void {
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token
        const decoded = jwt.verify(token, config.jwt.secret)
        socket.userId = decoded.id
        next()
      } catch (error) {
        next(new Error('Authentication error'))
      }
    })
  }
}
```

### Features Implemented

#### Chat System
```typescript
// Join Chat Room
socket.on('join-chat', (chatId: string) => {
  socket.join(`chat_${chatId}`)
})

// Send Message
socket.on('send-message', async (data) => {
  const message = await messageService.create({
    chatId: data.chatId,
    senderId: socket.userId,
    content: data.content,
    type: data.type || 'text'
  })
  
  // Broadcast to chat room
  socket.to(`chat_${data.chatId}`).emit('new-message', message)
})
```

#### Notification System
```typescript
// Send Targeted Notification
export const sendNotificationToUser = (userId: string, notification: any) => {
  io.to(`user_${userId}`).emit('notification', notification)
}

// Send Role-based Notification
export const sendNotificationToRole = (role: string, notification: any) => {
  io.to(`role_${role}`).emit('notification', notification)
}
```

---

## 🔧 Configuration Management

### Environment Variables Required

```bash
# Core Application
NODE_ENV=development|staging|production
SECRET_KEY=your-32-character-secret-key

# Email Service
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USERNAME=your-email@example.com
EMAIL_PASSWORD=your-email-password

# Payment Services
STRIPE_PUBLIC_KEY=pk_...
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...

PAYPAL_CLIENT_ID=your-paypal-client-id
PAYPAL_SECRET=your-paypal-secret

# Social Login
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

FACEBOOK_CLIENT_ID=your-facebook-app-id
FACEBOOK_CLIENT_SECRET=your-facebook-app-secret

# Location Services
GOOGLE_MAPS_API_KEY=your-google-maps-api-key

# File Storage
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

AWS_ACCESS_KEY_ID=your-access-key-id
AWS_SECRET_ACCESS_KEY=your-secret-access-key
AWS_REGION=us-east-1
AWS_BUCKET_NAME=your-bucket-name
```

### Security Considerations

#### API Key Protection
```typescript
// Use environment variables for sensitive keys
const config = {
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY
  }
}

// Never expose secrets in client responses
app.get('/api/config', (req, res) => {
  res.json({
    stripePublicKey: process.env.STRIPE_PUBLIC_KEY // Only public key
  })
})
```

#### Webhook Security
```typescript
// Verify Stripe webhook signatures
app.post('/webhooks/stripe', (req, res) => {
  const sig = req.headers['stripe-signature']
  const event = stripe.webhooks.constructEvent(
    req.body,
    sig,
    process.env.STRIPE_WEBHOOK_SECRET
  )
  
  // Process event
})
```

---

## 📊 Service Monitoring

### Health Checks
```typescript
// Service Health Monitoring
export const checkServiceHealth = async () => {
  const health = {
    database: await checkDatabaseConnection(),
    email: await checkEmailService(),
    payment: await checkPaymentServices(),
    storage: await checkStorageServices(),
    notifications: await checkNotificationService()
  }
  
  return health
}
```

### Error Handling
```typescript
// Service-specific error handling
try {
  const result = await stripe.paymentIntents.create(paymentData)
  return result
} catch (error) {
  if (error.code === 'card_declined') {
    throw AppError.badRequest('Payment method declined')
  } else if (error.code === 'rate_limit_exceeded') {
    throw AppError.tooManyRequests('Payment service temporarily unavailable')
  }
  throw AppError.internalServerError('Payment processing failed')
}
```

---

## 🔮 Future Integrations

### Planned Services
1. **Analytics**: Google Analytics 4
2. **SMS**: Twilio for SMS notifications
3. **CRM**: Salesforce integration
4. **Accounting**: QuickBooks integration
5. **Shipping**: FedEx/UPS APIs
6. **Analytics**: Custom dashboard analytics

### Integration Guidelines
1. **Security First**: Always use secure authentication
2. **Error Handling**: Graceful degradation when services fail
3. **Configuration**: Environment-based configuration
4. **Testing**: Mock services for development/testing
5. **Documentation**: Clear API documentation for each integration

---

**Last Updated**: [Date]  
**Version**: 1.0  
**Maintained By**: Development Team

For integration support, refer to the specific service documentation or contact the development team.