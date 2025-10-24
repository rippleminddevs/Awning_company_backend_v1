# 👥 Developer Guide - Awning Company Backend

## 🚀 Quick Start for New Developers

### Prerequisites
- **Node.js**: 18+ installed
- **npm**: Latest version
- **MongoDB**: Access to MongoDB database
- **Git**: Version control
- **VS Code**: Recommended IDE with extensions

### Initial Setup

#### 1. Clone and Install
```bash
git clone [repository-url]
cd awning-company-backend-v1
npm install
```

#### 2. Generator Dependencies
```bash
cd src/generator
npm install
cd ../../
```

#### 3. Environment Configuration
```bash
# Copy and configure environment file
cp .env.example .env

# Configure your environment variables
# See configuration/environment-setup.md for details
```

#### 4. Database Setup
- Configure MongoDB connection in environment files
- Ensure MongoDB is accessible (local or Atlas)
- Run database migrations if needed

#### 5. Start Development Server
```bash
npm run dev
```

Server will start on `http://localhost:5002` (development)

---

## 🏗️ Project Architecture Overview

### Module Structure
The project follows a **modular architecture** where each business domain is a separate module:

```
src/modules/
├── appointment/     # Appointment scheduling
├── auth/           # Authentication & authorization
├── category/       # Product categories
├── chat/           # Real-time chat
├── customer/       # Customer management
├── message/        # Chat messages
├── notification/   # Push notifications
├── order/          # Order management
├── product/        # Product catalog
├── quote/          # Quote generation
├── sale/           # Sales analytics
├── service/        # Service types
├── upload/         # File management
└── user/           # User management
```

### Key Directories
- **`src/common/`**: Shared utilities, base classes, interfaces
- **`src/middlewares/`**: Authentication, authorization, validation
- **`src/services/`**: External service integrations
- **`src/environments/`**: Environment-specific configurations

---

## 🛠️ Development Workflow

### 1. Creating a New Module

#### Using the Generator (Recommended)
```bash
npm run generate ModuleName
```

This creates a complete module structure with all necessary files.

#### Manual Module Creation
1. Create module folder: `src/modules/moduleName/`
2. Create all module files following the standard pattern
3. Update routes in `src/routes.ts`
4. Add module interfaces to appropriate locations

### 2. Standard Module Files

Each module must have these files:

#### `moduleNameInterface.ts`
```typescript
export interface ModuleName {
  _id: string
  name: string
  // ... other fields
  createdAt?: Date
  updatedAt?: Date
}

export interface CreateModuleNameDto {
  name: string
  // ... other fields
}

export interface UpdateModuleNameDto {
  name?: string
  // ... other optional fields
}
```

#### `moduleNameValidator.ts`
```typescript
import Joi from 'joi'

export const ModuleNameValidator = {
  getAll: Joi.object({
    page: Joi.number().integer().min(1).optional(),
    perPage: Joi.number().integer().min(1).optional(),
    search: Joi.string().optional(),
  }),
  
  create: Joi.object({
    name: Joi.string().required(),
    // ... other required fields
  }),
  
  update: Joi.object({
    name: Joi.string().optional(),
    // ... other optional fields
  }),
  
  getOne: Joi.object({
    id: Joi.string().required(),
  }),
}
```

#### `moduleNameModel.ts`
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
  name: {
    type: 'string',
    nullable: false,
  },
  // ... other field definitions
}

export class ModuleNameModel extends BaseModel<ModuleName> {
  private static instance: ModuleNameModel
  
  constructor() {
    const schema = createMongooseSchema(fields, {
      includeSoftDelete: true,
      includeTimestamps: true,
    })
    super('ModuleName', fields, schema)
  }
  
  public static getInstance(): ModuleNameModel {
    if (!ModuleNameModel.instance) {
      ModuleNameModel.instance = new ModuleNameModel()
    }
    return ModuleNameModel.instance
  }
}
```

### 3. Development Commands

```bash
# Development with hot reload
npm run dev

# Development with staging config
npm run dev:stag

# Type checking
npm run typecheck

# Code formatting
npm run format

# Build for production
npm run build

# Generate new module
npm run generate ModuleName
```

### 4. Git Workflow

#### Branch Naming
- `feature/feature-name`: New features
- `bugfix/bug-description`: Bug fixes
- `hotfix/urgent-fix`: Critical fixes
- `refactor/refactor-description`: Code refactoring

#### Commit Messages
```
type(scope): description

feat(auth): add social login support
fix(quote): resolve pricing calculation bug
docs(api): update customer endpoint documentation
```

---

## 📝 Coding Standards

### 1. TypeScript Guidelines

#### Use Strong Typing
```typescript
// ✅ Good
interface User {
  _id: string
  name: string
  email: string
  role: 'salesperson' | 'manager' | 'superadmin'
}

// ❌ Bad
const user: any = getUser()
```

#### Interface Naming
```typescript
// ✅ Use descriptive names
interface CustomerAppointment {
  // ...
}

// ✅ Use DTO suffix for data transfer objects
interface CreateCustomerDto {
  // ...
}
```

### 2. Error Handling

#### Use AppError Class
```typescript
import { AppError } from '../../common/utils/appError'

// ✅ Good
if (!user) {
  throw AppError.notFound('User not found')
}

if (!isValidEmail(email)) {
  throw AppError.badRequest('Invalid email format')
}
```

#### Controller Error Handling
```typescript
public create = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await this.service.create(req.body)
    this.handleResponse(res, result, 201)
  } catch (error) {
    this.handleError(res, error) // Handles both AppError and generic errors
  }
}
```

### 3. Database Patterns

#### Model Singleton Pattern
```typescript
// ✅ Always use singleton
export class CustomerModel extends BaseModel<Customer> {
  private static instance: CustomerModel
  
  public static getInstance(): CustomerModel {
    if (!CustomerModel.instance) {
      CustomerModel.instance = new CustomerModel()
    }
    return CustomerModel.instance
  }
}
```

#### Query Patterns
```typescript
// ✅ Use built-in methods
const customers = await this.model.getAll({ page: 1, perPage: 10 })

// ✅ Custom queries in service
public getByEmail = async (email: string): Promise<User | null> => {
  return this.model.getMongooseModel().findOne({ email })
}
```

### 4. API Response Patterns

#### Use Standardized Responses
```typescript
import { apiResponse } from '../../common/utils/apiResponse'

// ✅ Success response
apiResponse(res, data, 200)

// ✅ Created response
apiResponse(res, createdData, 201)

// ✅ With message
apiResponse(res, data, 200, 'Operation completed successfully')
```

### 5. Validation Patterns

#### Joi Schemas
```typescript
export const CreateCustomerValidator = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  type: Joi.string().valid('residential', 'commercial', 'contractor').required(),
  phoneNumber: Joi.string().pattern(/^[+]?[\d\s-()]+$/).optional(),
}).unknown(false) // Strict validation
```

---

## 🔐 Security Guidelines

### 1. Authentication
```typescript
// ✅ Always protect routes
router.use(authenticate)

// ✅ Role-based access
router.post('/', requiredRole(['manager', 'superadmin']), controller.create)
```

### 2. Input Validation
```typescript
// ✅ Always validate inputs
router.post('/', validateBody(CreateCustomerValidator), controller.create)
router.get('/', validateQuery(GetCustomersValidator), controller.getAll)
```

### 3. Data Access Control
```typescript
// ✅ Check user permissions in services
public getCustomerById = async (id: string, userId: string): Promise<Customer> => {
  const customer = await this.model.getById(id)
  
  // Check if user has access to this customer
  if (!this.canUserAccessCustomer(customer, userId)) {
    throw AppError.forbidden('Access denied')
  }
  
  return customer
}
```

---

## 🧪 Testing Guidelines

### 1. Unit Testing
```typescript
// Test services
describe('CustomerService', () => {
  let service: CustomerService
  
  beforeEach(() => {
    service = new CustomerService()
  })
  
  it('should create customer successfully', async () => {
    const customerData = { name: 'Test Customer', email: 'test@example.com' }
    const result = await service.create(customerData)
    
    expect(result).toHaveProperty('_id')
    expect(result.name).toBe(customerData.name)
  })
})
```

### 2. Integration Testing
```typescript
// Test API endpoints
describe('Customer API', () => {
  it('POST /api/customers should create customer', async () => {
    const response = await request(app)
      .post('/api/customers')
      .set('Authorization', `Bearer ${token}`)
      .send(customerData)
      .expect(201)
      
    expect(response.body.success).toBe(true)
    expect(response.body.data).toHaveProperty('_id')
  })
})
```

---

## 🐛 Debugging Guidelines

### 1. Logging
```typescript
// ✅ Use structured logging
console.log('Creating customer for user:', userId, 'with data:', customerData)

// ✅ Error logging
console.error('Failed to create customer:', {
  userId,
  error: error.message,
  stack: error.stack
})
```

### 2. Debugging Tips
- Use `console.log` for quick debugging
- Check database queries in MongoDB Compass
- Use VS Code debugger for complex issues
- Test API endpoints with Postman or Insomnia

---

## 📚 Useful Resources

### Internal Documentation
- [Architecture Guide](../docs/architecture-guide.md)
- [API Documentation](../docs/api-documentation.md)
- [Database Schema](../docs/database-schema.md)
- [Environment Setup](../configuration/environment-setup.md)

### External Resources
- [Mongoose Documentation](https://mongoosejs.com/)
- [Express.js Guide](https://expressjs.com/en/guide/)
- [Joi Validation](https://joi.dev/)
- [JWT Documentation](https://jwt.io/)

### VS Code Extensions
- TypeScript Importer
- Prettier - Code formatter
- ESLint
- MongoDB for VS Code
- Thunder Client (for API testing)

---

## 🤝 Team Collaboration

### 1. Code Review Process
1. Create pull request from feature branch
2. Request review from team members
3. Address review comments
4. Ensure CI/CD passes
5. Merge to main branch

### 2. Communication
- Use GitHub Issues for bug reports and feature requests
- Team chat for quick questions
- Regular standup meetings for progress updates

### 3. Knowledge Sharing
- Document new features in appropriate documentation
- Share learnings in team meetings
- Update this developer guide with new insights

---

## 🚨 Common Pitfalls to Avoid

### 1. Database Issues
- Always validate ObjectIds before queries
- Use lean() for read-only operations
- Be careful with async/await in loops

### 2. Performance Issues
- Avoid N+1 query problems
- Use pagination for large datasets
- Implement proper indexing

### 3. Security Issues
- Never expose sensitive data in responses
- Always validate user input
- Use parameterized queries (Mongoose handles this)

### 4. Code Quality Issues
- Don't use `any` type
- Always handle errors properly
- Follow consistent naming conventions

---

## 📞 Getting Help

### For Technical Questions
1. Check existing documentation
2. Search GitHub issues
3. Ask in team chat
4. Create a discussion issue

### For Process Questions
1. Check this developer guide
2. Ask team lead
3. Review previous similar work

### Emergency Contacts
- **Tech Lead**: [Contact information]
- **Team Lead**: [Contact information]
- **DevOps**: [Contact information]

---

**Last Updated**: [Date]  
**Maintained By**: Development Team  
**Version**: 1.0

Welcome to the team! We're excited to have you contribute to the Awning Company Backend project. 🎉