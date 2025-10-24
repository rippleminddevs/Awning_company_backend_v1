# 🏗️ Architecture Guide - Awning Company Backend

## 🎯 Design Philosophy

### Core Principles
1. **Modularity**: Every feature is an independent module
2. **Scalability**: Built to handle business growth
3. **Maintainability**: Clean code that's easy to understand and modify
4. **Security**: Security-first approach at every layer
5. **Performance**: Optimized for speed and efficiency

### Architectural Patterns
- **MVC Pattern**: Controller → Service → Model
- **Repository Pattern**: Data access abstraction
- **Singleton Pattern**: Service instances and database connections
- **Factory Pattern**: Schema and model creation
- **Strategy Pattern**: Pricing calculations and payment processing

## 🏛️ System Architecture

### High-Level Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Client Apps   │    │   Web Client    │    │  Mobile Apps    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
         ┌───────────────────────▼───────────────────────┐
         │            Load Balancer (Future)             │
         └───────────────────────┬───────────────────────┘
                                 │
         ┌───────────────────────▼───────────────────────┐
         │              Express.js App                   │
         │  ┌─────────────┐  ┌─────────────┐  ┌─────────┐│
         │  │   Routes    │  │ Middleware  │  │ Socket  ││
         │  │   Layer     │  │   Layer     │  │   IO    ││
         │  └─────────────┘  └─────────────┘  └─────────┘│
         └───────────────────────┬───────────────────────┘
                                 │
         ┌───────────────────────▼───────────────────────┐
         │            Business Logic Layer              │
         │  ┌─────────────┐  ┌─────────────┐  ┌─────────┐│
         │  │ Controllers │  │  Services   │  │Validators││
         │  │             │  │             │  │         ││
         │  └─────────────┘  └─────────────┘  └─────────┘│
         └───────────────────────┬───────────────────────┘
                                 │
         ┌───────────────────────▼───────────────────────┐
         │              Data Access Layer               │
         │  ┌─────────────┐  ┌─────────────┐  ┌─────────┐│
         │  │   Models    │  │   Utils     │  │ External││
         │  │             │  │             │  │Services ││
         │  └─────────────┘  └─────────────┘  └─────────┘│
         └───────────────────────┬───────────────────────┘
                                 │
         ┌───────────────────────▼───────────────────────┐
         │               Data Storage                   │
         │  ┌─────────────┐  ┌─────────────┐  ┌─────────┐│
         │  │  MongoDB    │  │   Cloud     │  │External ││
         │  │  (Primary)  │  │   Storage   │  │ APIs    ││
         │  └─────────────┘  └─────────────┘  └─────────┘│
         └──────────────────────────────────────────────────┘
```

## 🔧 Module Architecture

### Module Structure
Each business module follows a consistent structure:

```
src/modules/[moduleName]/
├── moduleNameInterface.ts     # TypeScript interfaces and types
├── moduleNameValidator.ts     # Joi validation schemas
├── moduleNameModel.ts         # Database model and schema
├── moduleNameService.ts       # Business logic layer
├── moduleNameController.ts    # Request/response handling
├── moduleNameRoutes.ts        # Route definitions
└── (Optional) Additional files
```

### Module Design Pattern

#### Interface Layer (`*Interface.ts`)
```typescript
export interface EntityName {
  _id: string
  field1: string
  field2: number
  relationship?: RelatedEntity
  createdAt?: Date
  updatedAt?: Date
}

export interface CreateEntityNameDto {
  field1: string
  field2: number
}

export interface UpdateEntityNameDto {
  field1?: string
  field2?: number
}
```

#### Validation Layer (`*Validator.ts`)
```typescript
import Joi from 'joi'

export const EntityNameValidator = {
  getAll: Joi.object({
    page: Joi.number().integer().min(1).optional(),
    perPage: Joi.number().integer().min(1).optional(),
    search: Joi.string().optional(),
  }),
  
  create: Joi.object({
    field1: Joi.string().required(),
    field2: Joi.number().required(),
  }),
  
  update: Joi.object({
    field1: Joi.string().optional(),
    field2: Joi.number().optional(),
  }),
  
  getOne: Joi.object({
    id: Joi.string().required(),
  }),
}
```

#### Model Layer (`*Model.ts`)
```typescript
import { BaseModel } from '../../common/core/baseModel'
import { createMongooseSchema } from '../../common/utils/schemaUtils'

const fields: FieldsConfig = {
  _id: {
    type: 'integer',
    mongooseType: 'ObjectId',
    nullable: false,
    primaryKey: true,
  },
  field1: {
    type: 'string',
    nullable: false,
  },
  field2: {
    type: 'number',
    nullable: false,
  },
}

export class EntityNameModel extends BaseModel<EntityName> {
  private static instance: EntityNameModel
  
  constructor() {
    const schema = createMongooseSchema(fields, {
      includeSoftDelete: true,
      includeTimestamps: true,
    })
    super('EntityName', fields, schema)
  }
  
  public static getInstance(): EntityNameModel {
    if (!EntityNameModel.instance) {
      EntityNameModel.instance = new EntityNameModel()
    }
    return EntityNameModel.instance
  }
}
```

#### Service Layer (`*Service.ts`)
```typescript
export class EntityNameService extends BaseService<EntityName> {
  constructor() {
    super(EntityNameModel.getInstance())
  }
  
  public customBusinessMethod = async (params: CustomParams): Promise<CustomResult> => {
    // Business logic implementation
    const entity = await this.model.getById(params.id)
    if (!entity) {
      throw AppError.notFound('Entity not found')
    }
    
    // Additional business logic
    return processedResult
  }
}
```

#### Controller Layer (`*Controller.ts`)
```typescript
export class EntityNameController extends BaseController<EntityName, EntityNameService> {
  constructor() {
    super(new EntityNameService())
  }
  
  public customAction = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await this.service.customBusinessMethod(req.body)
      this.handleResponse(res, result)
    } catch (error) {
      this.handleError(res, error)
    }
  }
}
```

#### Route Layer (`*Routes.ts`)
```typescript
import { Router } from 'express'
import { validateQuery, validateBody, validateParams } from '../../common/utils/helpers'
import { authenticate } from '../../middlewares/authMiddleware'
import { requiredRole } from '../../middlewares/authorization'

const router = Router()
router.use(authenticate) // Auth for all routes

router.get('/', validateQuery(EntityNameValidator.getAll), controller.getAll)
router.get('/:id', validateParams(EntityNameValidator.getOne), controller.getById)
router.post('/', validateBody(EntityNameValidator.create), controller.create)
router.put('/:id', validateParams(EntityNameValidator.update), validateBody(EntityNameValidator.update), controller.update)
router.delete('/:id', validateParams(EntityNameValidator.getOne), controller.delete)

// Custom routes
router.post('/custom-action', validateBody(customValidator), controller.customAction)

export default router
```

## 🔄 Request Flow Architecture

### Standard Request Flow
```
1. Client Request
   ↓
2. CORS & Security Middleware
   ↓
3. Authentication Middleware (if protected)
   ↓
4. Authorization Middleware (if role-based)
   ↓
5. Route Handler
   ↓
6. Validation Middleware (Joi)
   ↓
7. Controller Method
   ↓
8. Service Method (Business Logic)
   ↓
9. Model Method (Data Access)
   ↓
10. Database Operation
   ↓
11. Response Processing
   ↓
12. Client Response
```

### Error Handling Flow
```
Error Occurs
   ↓
Controller Catch Block
   ↓
BaseController.handleError()
   ↓
AppError Processing
   ↓
Response Formatting (apiError)
   ↓
Standardized Error Response
```

## 🗄️ Database Architecture

### MongoDB Schema Design
- **Dynamic Schema Creation**: Field-based schema generation
- **Relationships**: Referential integrity using ObjectId
- **Indexing**: Performance optimization with proper indexes
- **Soft Deletes**: Data preservation with deletion flags
- **Timestamps**: Automatic createdAt/updatedAt tracking

### Key Database Patterns

#### Referenced Relationships
```typescript
// Quote references Customer
customer: {
  type: 'string',
  mongooseType: 'ObjectId',
  ref: 'Customer',
  nullable: false,
}

// Quote has multiple Products
products: [{
  product: {
    type: 'string',
    mongooseType: 'ObjectId',
    ref: 'Product',
  },
  quantity: Number,
  unitPrice: Number,
  totalPrice: Number,
}]
```

#### Embedded Documents
```typescript
// Location embedded in Customer
location: {
  type: 'subdocument',
  nullable: true,
  document: {
    address: { type: 'string', nullable: true },
    latitude: { type: 'number', nullable: false },
    longitude: { type: 'number', nullable: false },
  },
}
```

## 🔐 Security Architecture

### Multi-Layer Security

#### 1. Authentication Layer
- **JWT Tokens**: Stateless authentication
- **Refresh Tokens**: Long-term session management
- **Social Login**: OAuth 2.0 integration
- **Email Verification**: OTP-based verification

#### 2. Authorization Layer
- **Role-Based Access Control**: Salesperson, Manager, Superadmin
- **Resource-Level Access**: User can only access assigned resources
- **Route Protection**: Middleware-based route protection

#### 3. Data Protection
- **Input Validation**: Joi schema validation
- **SQL Injection Prevention**: Mongoose ODM protection
- **XSS Protection**: Input sanitization
- **Password Security**: bcrypt with salt rounds

#### 4. Infrastructure Security
- **CORS Configuration**: Controlled cross-origin access
- **Rate Limiting**: Request throttling
- **Helmet.js**: Security headers
- **Environment Encryption**: Encrypted configuration files

## 📡 Real-time Architecture

### Socket.IO Implementation
```typescript
// Connection Management
io.use((socket, next) => {
  // JWT authentication for WebSocket
  const token = socket.handshake.auth.token
  // Verify token and attach user
  next()
})

// Room-based Communication
socket.join(`user_${userId}`)
socket.join(`role_${role}`)

// Event-driven Architecture
socket.emit('notification', data)
socket.to(`user_${userId}`).emit('message', data)
```

### Real-time Features
1. **Chat System**: Instant messaging
2. **Notifications**: Real-time alerts
3. **Status Updates**: Live order status changes
4. **Typing Indicators**: Chat UX enhancements

## 🔄 External Services Architecture

### Service Integration Pattern
```typescript
class ExternalService {
  private apiKey: string
  private baseUrl: string
  
  constructor() {
    this.apiKey = config.service.apiKey
    this.baseUrl = config.service.baseUrl
  }
  
  public async makeRequest(endpoint: string, data: any): Promise<any> {
    try {
      const response = await axios.post(`${this.baseUrl}${endpoint}`, data, {
        headers: { Authorization: `Bearer ${this.apiKey}` }
      })
      return response.data
    } catch (error) {
      throw AppError.internalServerError('Service unavailable')
    }
  }
}
```

### Integrated Services
1. **Payment Gateways**: Stripe & PayPal
2. **Email Service**: Nodemailer with SMTP
3. **File Storage**: Cloudinary, AWS S3, Local
4. **Push Notifications**: Firebase FCM
5. **Location Services**: Google Maps API
6. **Social Login**: Google & Facebook OAuth

## 🚀 Performance Architecture

### Optimization Strategies

#### 1. Database Optimization
- **Indexing**: Strategic index placement
- **Query Optimization**: Efficient query design
- **Connection Pooling**: Database connection management
- **Caching**: In-memory caching for frequent data

#### 2. Application Optimization
- **Async Processing**: Non-blocking I/O operations
- **Compression**: Gzip compression for responses
- **Static File Serving**: Efficient static asset delivery
- **Memory Management**: Efficient memory usage patterns

#### 3. Network Optimization
- **Request Batching**: Group multiple operations
- **Pagination**: Large dataset handling
- **Lazy Loading**: Load data on demand
- **CDN Integration**: Content delivery network ready

## 🔧 Configuration Architecture

### Environment-Based Configuration
```typescript
// Development: Plain JSON
{
  "app": { "name": "Development", "port": 5002 },
  "database": { "connection": "mongodb" }
}

// Production: Encrypted JSON
{
  "data": "U2FsdGVkX1+encrypted_data_here"
}
```

### Configuration Management
1. **Environment Files**: Separate configs per environment
2. **Encryption**: Production configs encrypted with AES-256
3. **Runtime Loading**: Dynamic config loading based on NODE_ENV
4. **Validation**: Config schema validation
5. **Security**: Sensitive data protection

## 🔮 Scalability Architecture

### Horizontal Scaling Readiness
1. **Stateless Design**: Application doesn't rely on server state
2. **Session Storage**: Redis-ready session storage
3. **Database Scaling**: MongoDB Atlas auto-scaling
4. **Load Balancing**: Ready for load balancer deployment
5. **Microservices**: Architecture supports service decomposition

### Performance Monitoring
1. **Health Checks**: `/health` endpoint for monitoring
2. **Error Tracking**: Centralized error logging
3. **Performance Metrics**: Request timing and response analysis
4. **Resource Monitoring**: Memory and CPU usage tracking

This architecture provides a solid foundation for a scalable, maintainable, and secure enterprise application that can grow with the business needs.