# 🔧 Environment Setup Guide

## 📋 Overview

This guide covers setting up the development environment for the Awning Company Backend project. The project supports multiple environments with different configurations.

## 🏗️ Environment Architecture

### Environment Types
1. **Development**: Local development with hot reload
2. **Staging**: Pre-production testing environment
3. **Production**: Live environment with security hardening

### Configuration Management
- **Development**: Plain JSON configuration files
- **Production**: AES-256 encrypted configuration files
- **Runtime Loading**: Dynamic config loading based on `NODE_ENV`

---

## 🚀 Initial Setup

### Prerequisites
- **Node.js**: 18+ (use LTS version)
- **npm**: Latest version
- **MongoDB**: Local installation or Atlas access
- **Git**: Version control system
- **VS Code**: Recommended IDE

### 1. Project Setup

```bash
# Clone the repository
git clone [repository-url]
cd awning-company-backend-v1

# Install root dependencies
npm install

# Install generator dependencies
cd src/generator
npm install
cd ../../

# Install tsx globally for development
npm install -g tsx
```

### 2. Environment Variables

Create a `.env` file in the project root:

```bash
# Copy example environment file
cp .env.example .env
```

#### Required Environment Variables
```bash
# Application Environment
NODE_ENV=development          # development | staging | production
SECRET_KEY=your-secret-key-here  # For config encryption (32+ characters)

# Server Configuration
PORT=5002                     # Development port
URL=http://localhost:5002     # Server URL
```

### 3. Database Configuration

#### MongoDB Setup
```bash
# Local MongoDB (if running locally)
# Ensure MongoDB is installed and running
mongod

# Or configure MongoDB Atlas connection
# Update in src/environments/development.json
```

#### Database Connection Configuration
```json
{
  "database": {
    "connection": "mongodb",
    "mongodb": {
      "host": "localhost",
      "port": 27017,
      "username": "",
      "password": "",
      "database": "awning_company_dev",
      "atlas": false
    }
  }
}
```

---

## 🔧 Environment Configuration

### Development Environment (`src/environments/development.json`)

```json
{
  "app": {
    "name": "Development",
    "port": 5002,
    "url": "http://localhost:5002",
    "version": "0.0.1",
    "corsOrigin": "*"
  },
  "database": {
    "connection": "mongodb",
    "mongodb": {
      "host": "hoffnmazor.u8t7t.mongodb.net",
      "port": 27017,
      "username": "admin",
      "password": "YBfFHwu4bw98l4zT",
      "database": "awning_company",
      "atlas": true
    }
  },
  "jwt": {
    "secret": "accessKey-awning_company",
    "accessTokenExpiry": "1d",
    "refreshTokenExpiry": "7d"
  },
  "email": {
    "host": "sandbox.smtp.mailtrap.io",
    "port": 2525,
    "username": "your-mailtrap-username",
    "password": "your-mailtrap-password",
    "fromAddress": "no-reply@awningcompany.com",
    "secure": false
  },
  "payment": {
    "stripe": {
      "publicKey": "pk_test_...",
      "secretKey": "sk_test_...",
      "webhookSecret": ""
    },
    "paypal": {
      "baseUrl": "https://api-m.sandbox.paypal.com",
      "clientId": "your-paypal-client-id",
      "secret": "your-paypal-secret",
      "sandbox": true
    }
  },
  "socialLogin": {
    "google": {
      "clientID": "your-google-client-id",
      "clientSecret": "your-google-client-secret"
    },
    "facebook": {
      "clientID": "your-facebook-client-id",
      "clientSecret": "your-facebook-client-secret"
    }
  },
  "upload": {
    "uploadType": "local",
    "uploadDir": "uploads",
    "cloudinary": {
      "cloudName": "your-cloudinary-cloud",
      "apiKey": "your-cloudinary-key",
      "apiSecret": "your-cloudinary-secret"
    }
  },
  "location": {
    "google": {
      "apiKey": "your-google-maps-api-key",
      "baseUrl": "https://maps.googleapis.com/maps/api/geocode/json"
    }
  }
}
```

### Production Environment (`src/environments/production.json`)

```json
{
  "app": {
    "name": "Production",
    "port": 5000,
    "url": "https://your-production-url.com",
    "version": "1.0.0",
    "corsOrigin": "your-frontend-domain"
  },
  "database": {
    "connection": "mongodb",
    "mongodb": {
      "host": "your-production-mongodb-host",
      "port": 27017,
      "username": "prod-user",
      "password": "secure-password",
      "database": "awning_company",
      "atlas": true
    }
  },
  "jwt": {
    "secret": "your-production-jwt-secret",
    "accessTokenExpiry": "15m",
    "refreshTokenExpiry": "7d"
  },
  "email": {
    "host": "your-production-email-host",
    "port": 465,
    "username": "your-production-email",
    "password": "your-production-email-password",
    "fromAddress": "no-reply@awningcompany.com",
    "secure": true
  }
  // ... other production configurations
}
```

---

## 🔐 Security Configuration

### Encryption Setup
For production environments, configuration files are encrypted using AES-256 encryption.

#### Setting up Encryption
```bash
# Your SECRET_KEY must be 32+ characters long
# Use a strong random key
SECRET_KEY=$(openssl rand -hex 32)
```

#### Encrypting Production Config
```bash
# Set NODE_ENV to production
export NODE_ENV=production

# Run build process to encrypt config
npm run build
```

The build process will:
1. Encrypt `src/environments/production.json`
2. Create `dist/environments/production.enc.json`
3. Copy necessary files to `dist/` directory

### Environment Variables Security

#### .gitignore
```bash
# Environment files
.env
.env.local
.env.production

# Build output
dist/

# Logs
logs/
*.log

# Runtime data
pids/
*.pid
*.seed
*.pid.lock
```

#### Service Account Keys
```bash
# Firebase service account
serviceAccountKey.json  # Should be committed if development
# For production, use environment variables or secure storage
```

---

## 🗄️ Database Setup

### MongoDB Atlas Setup

#### 1. Create Atlas Cluster
1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Create new cluster (M0 or higher for production)
3. Configure network access (IP whitelist)
4. Create database user

#### 2. Get Connection String
```
mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
```

#### 3. Update Environment Config
```json
{
  "database": {
    "mongodb": {
      "host": "cluster.mongodb.net",
      "username": "your-username",
      "password": "your-password",
      "database": "awning_company",
      "atlas": true
    }
  }
}
```

### Local MongoDB Setup

#### macOS
```bash
# Install with Homebrew
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB
brew services start mongodb-community
```

#### Ubuntu/Debian
```bash
# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list

sudo apt-get update
sudo apt-get install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod
```

#### Windows
```bash
# Download and install from MongoDB website
# Or use Chocolatey
choco install mongodb
```

---

## 🌐 External Services Setup

### 1. Email Service (Mailtrap for Development)

#### Mailtrap Setup
1. Go to [Mailtrap](https://mailtrap.io/)
2. Create new inbox
3. Get SMTP credentials
4. Update environment config

#### Production Email (SendGrid/Amazon SES)
```json
{
  "email": {
    "host": "smtp.sendgrid.net",
    "port": 587,
    "username": "apikey",
    "password": "your-sendgrid-api-key",
    "fromAddress": "no-reply@awningcompany.com",
    "secure": false
  }
}
```

### 2. Payment Gateways

#### Stripe Setup
1. Create [Stripe Account](https://stripe.com/)
2. Get API keys from Dashboard
3. Configure webhooks

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

#### PayPal Setup
1. Create [PayPal Developer Account](https://developer.paypal.com/)
2. Create REST API app
3. Get client credentials

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

### 3. Social Login

#### Google OAuth Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs

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

#### Facebook OAuth Setup
1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create new app
3. Add Facebook Login product
4. Configure OAuth redirect URIs

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

### 4. File Storage

#### Cloudinary Setup
1. Create [Cloudinary Account](https://cloudinary.com/)
2. Get API credentials from Dashboard

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

#### AWS S3 Setup
1. Create AWS account
2. Create S3 bucket
3. Create IAM user with S3 permissions
4. Generate access keys

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

### 5. Firebase Cloud Messaging

#### FCM Setup
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create new project
3. Enable Cloud Messaging
4. Download service account key
5. Save as `serviceAccountKey.json`

---

## 🚀 Running the Application

### Development Mode
```bash
# Start development server with hot reload
npm run dev

# Server runs on http://localhost:5002
```

### Staging Mode
```bash
# Set environment
export NODE_ENV=staging

# Start staging server
npm run dev:stag
```

### Production Mode
```bash
# Set environment
export NODE_ENV=production

# Build application
npm run build

# Start production server
npm start
```

---

## 🧪 Testing the Setup

### Health Check
```bash
# Test server is running
curl http://localhost:5002/health

# Expected response
{
  "success": true,
  "statusCode": 200,
  "data": {
    "status": "OK"
  }
}
```

### Database Connection Test
```bash
# Check MongoDB connection in logs
# Look for "✅ Connected to MongoDB" message
```

### API Testing
```bash
# Test basic API endpoint
curl http://localhost:5002/

# Test with Postman or Insomnia
# Import collection if available
```

---

## 🔧 Troubleshooting

### Common Issues

#### 1. Port Already in Use
```bash
# Kill process on port
lsof -ti:5002 | xargs kill

# Or use different port
PORT=5003 npm run dev
```

#### 2. Database Connection Failed
```bash
# Check MongoDB is running
brew services list | grep mongodb

# Check network access for Atlas
# Ensure IP is whitelisted in Atlas settings
```

#### 3. Configuration Not Loading
```bash
# Check NODE_ENV is set
echo $NODE_ENV

# Check environment file exists
ls -la src/environments/
```

#### 4. Build Fails
```bash
# Check SECRET_KEY is set
echo $SECRET_KEY

# Ensure it's 32+ characters
# Generate new key if needed
```

### Debug Mode
```bash
# Enable debug logging
DEBUG=* npm run dev

# Check all logs
tail -f logs/error.log
tail -f logs/combined.log
```

---

## 📋 Environment Checklist

### Development Setup ✅
- [ ] Node.js 18+ installed
- [ ] Project dependencies installed
- [ ] Generator dependencies installed
- [ ] `.env` file configured
- [ ] MongoDB connection configured
- [ ] Development server starts successfully
- [ ] Health check passes

### Production Setup ✅
- [ ] Production environment configured
- [ ] SECRET_KEY configured (32+ chars)
- [ ] Database connection tested
- [ ] All external services configured
- [ ] Build process completes
- [ ] Configuration encryption working
- [ ] Production server starts successfully

### Security Checklist ✅
- [ ] API keys secured
- [ ] Database credentials strong
- [ ] JWT secrets complex
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] HTTPS configured (production)
- [ ] Environment variables protected

---

**Last Updated**: [Date]  
**Version**: 1.0  
**Maintained By**: Development Team

For additional help, refer to the [Troubleshooting Guide](../docs/troubleshooting.md) or contact the development team.