# 🗃️ Database Schema Guide

## 📋 Overview
This document provides a comprehensive overview of the database schema for the Awning Company Backend. The system uses MongoDB with Mongoose ODM for data persistence.

---

## 🏗️ Database Architecture

### Database: MongoDB
- **ODM**: Mongoose
- **Schema Design**: Dynamic schema creation with field types
- **Relationships**: Referential integrity using ObjectId references
- **Indexing**: Performance optimization with proper indexing
- **Soft Deletes**: Data preservation with deletion flags
- **Timestamps**: Automatic createdAt/updatedAt tracking

### Connection Configuration
```typescript
// MongoDB Atlas Connection
const connectionString = atlas 
  ? `mongodb+srv://${username}:${password}@${host}/${database}?retryWrites=true&w=majority`
  : `mongodb://${host}:${port}/${database}`
```

---

## 👥 User Management

### Users Collection
```typescript
interface User {
  _id: string                          // ObjectId
  name: string                        // User full name
  email: string                       // Unique email address
  password?: string                   // Hashed password (bcrypt)
  googleId?: string                   // Google OAuth ID
  facebookId?: string                 // Facebook OAuth ID
  deviceTokens?: string[]             // FCM tokens for push notifications
  location?: Location                 // User's location (subdocument)
  profilePicture?: string             // Reference to Upload collection
  phoneNumber?: string                // Phone number
  role?: 'salesperson' | 'manager' | 'superadmin'  // User role
  isAdmin?: boolean                   // Admin privileges
  isVerified: boolean                 // Email verification status
  createdAt?: Date                    // Auto-generated
  updatedAt?: Date                    // Auto-generated
  deletedAt?: Date                    // Soft delete timestamp
}
```

#### Location Subdocument
```typescript
interface Location {
  address?: string                    // Full address
  latitude: number                    // GPS latitude
  longitude: number                   // GPS longitude
}
```

#### Indexes
```javascript
// Unique indexes
db.users.createIndex({ email: 1 }, { unique: true })
db.users.createIndex({ googleId: 1 }, { unique: true, sparse: true })
db.users.createIndex({ facebookId: 1 }, { unique: true, sparse: true })

// Performance indexes
db.users.createIndex({ role: 1 })
db.users.createIndex({ deletedAt: 1 })
```

---

## 🏢 Customer Management

### Customers Collection
```typescript
interface Customer {
  _id: string                          // ObjectId
  name: string                        // Customer name
  email?: string                      // Customer email
  phoneNumber?: string                // Phone number
  type: 'residential' | 'commercial' | 'contractor'  // Customer type
  businessName?: string               // Business name (for commercial)
  address?: Location                  // Customer address
  assignedTo?: string                 // Assigned salesperson (ObjectId)
  leadSource?: string                 // How customer was acquired
  notes?: string                      // Additional notes
  serviceRequests?: string[]          // Service request descriptions
  createdAt?: Date                    // Auto-generated
  updatedAt?: Date                    // Auto-generated
  deletedAt?: Date                    // Soft delete timestamp
}
```

#### Indexes
```javascript
db.customers.createIndex({ email: 1 }, { unique: true, sparse: true })
db.customers.createIndex({ type: 1 })
db.customers.createIndex({ assignedTo: 1 })
db.customers.createIndex({ leadSource: 1 })
db.customers.createIndex({ deletedAt: 1 })
```

---

## 📅 Appointment Management

### Appointments Collection
```typescript
interface Appointment {
  _id: string                          // ObjectId
  customerId: string                  // Customer reference
  date: Date                          // Appointment date/time
  duration: number                    // Duration in minutes
  type: string                        // Appointment type
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled'  // Status
  assignedTo: string                  // Salesperson (ObjectId)
  notes?: string                      // Appointment notes
  address?: Location                  // Appointment location
  createdAt?: Date                    // Auto-generated
  updatedAt?: Date                    // Auto-generated
  deletedAt?: Date                    // Soft delete timestamp
}
```

#### Indexes
```javascript
db.appointments.createIndex({ customerId: 1 })
db.appointments.createIndex({ date: 1 })
db.appointments.createIndex({ assignedTo: 1 })
db.appointments.createIndex({ status: 1 })
db.appointments.createIndex({ deletedAt: 1 })
```

---

## 🛍️ Product Management

### Products Collection
```typescript
interface Product {
  _id: string                          // ObjectId
  name: string                        // Product name
  description?: string                // Product description
  category?: string                   // Product category (ObjectId)
  sku?: string                        // Stock keeping unit
  images?: string[]                   // Product images (Upload references)
  specifications: {
    width: number                      // Width in feet
    height: number                     // Height in feet
    projection: number                 // Projection in feet
    color?: string                     // Color option
    fabric?: string                    // Fabric type
    hardware?: string                  // Hardware type
    installation?: boolean             // Installation included
    hood?: boolean                     // Hood included
  }
  pricing: {
    basePrice: number                  // Base price
    widthRate: number                  // Rate per width foot
    heightRate: number                 // Rate per height foot
    projectionRate: number             // Rate per projection foot
    colorSurcharge?: number            // Color option surcharge
    hardwareSurcharge?: number         // Hardware surcharge
    installationFee?: number           // Installation fee
    hoodFee?: number                   // Hood fee
  }
  isActive: boolean                    // Product availability
  createdAt?: Date                    // Auto-generated
  updatedAt?: Date                    // Auto-generated
  deletedAt?: Date                    // Soft delete timestamp
}
```

#### Indexes
```javascript
db.products.createIndex({ name: 1 })
db.products.createIndex({ category: 1 })
db.products.createIndex({ sku: 1 }, { unique: true, sparse: true })
db.products.createIndex({ isActive: 1 })
db.products.createIndex({ deletedAt: 1 })
```

### Categories Collection
```typescript
interface Category {
  _id: string                          // ObjectId
  name: string                        // Category name
  description?: string                // Category description
  parent?: string                     // Parent category (ObjectId)
  isActive: boolean                   // Category availability
  createdAt?: Date                    // Auto-generated
  updatedAt?: Date                    // Auto-generated
  deletedAt?: Date                    // Soft delete timestamp
}
```

#### Indexes
```javascript
db.categories.createIndex({ name: 1 })
db.categories.createIndex({ parent: 1 })
db.categories.createIndex({ isActive: 1 })
db.categories.createIndex({ deletedAt: 1 })
```

---

## 💰 Quote Management

### Quotes Collection
```typescript
interface Quote {
  _id: string                          // ObjectId
  quoteNumber: string                 // Unique quote number
  customerId: string                  // Customer reference
  appointmentId?: string              // Related appointment
  salespersonId: string               // Salesperson (ObjectId)
  items: QuoteItem[]                  // Quote line items
  pricing: {
    subtotal: number                  // Items subtotal
    installationFee: number           // Installation charges
    taxRate: number                   // Tax rate
    taxAmount: number                 // Tax amount
    totalAmount: number               // Total quote amount
  }
  paymentStructure: {
    depositAmount: number             // Required deposit
    depositPercentage: number         // Deposit percentage
    paymentSchedule: PaymentSchedule[]  // Payment milestones
  }
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired'  // Quote status
  validUntil: Date                    // Quote expiry date
  notes?: string                      // Additional notes
  documents?: string[]                // Related documents (Upload references)
  createdAt?: Date                    // Auto-generated
  updatedAt?: Date                    // Auto-generated
  deletedAt?: Date                    // Soft delete timestamp
}
```

#### Quote Item Subdocument
```typescript
interface QuoteItem {
  product: string                      // Product reference (ObjectId)
  specifications: {
    width: number                      // Custom width
    height: number                     // Custom height
    projection: number                 // Custom projection
    color?: string                     // Selected color
    fabric?: string                    // Selected fabric
    hardware?: string                  // Selected hardware
    installation?: boolean             // Installation option
    hood?: boolean                     // Hood option
  }
  pricing: {
    unitPrice: number                 // Calculated unit price
    quantity: number                   // Quantity
    totalPrice: number                 // Item total
  }
  notes?: string                      // Item-specific notes
}
```

#### Payment Schedule Subdocument
```typescript
interface PaymentSchedule {
  milestone: string                   // Payment milestone
  percentage: number                  // Percentage of total
  amount: number                      // Amount
  dueDate?: Date                      // Due date (if applicable)
}
```

#### Indexes
```javascript
db.quotes.createIndex({ quoteNumber: 1 }, { unique: true })
db.quotes.createIndex({ customerId: 1 })
db.quotes.createIndex({ salespersonId: 1 })
db.quotes.createIndex({ status: 1 })
db.quotes.createIndex({ validUntil: 1 })
db.quotes.createIndex({ deletedAt: 1 })
```

---

## 📦 Order Management

### Orders Collection
```typescript
interface Order {
  _id: string                          // ObjectId
  orderNumber: string                 // Unique order number
  quoteId: string                     // Source quote (ObjectId)
  customerId: string                  // Customer reference
  salespersonId: string               // Salesperson (ObjectId)
  items: OrderItem[]                  // Order line items
  specifications: {
    // Customer-specific specifications
    customNotes?: string              // Custom manufacturing notes
    specialRequirements?: string[]    // Special requirements
  }
  pricing: {
    unitPrice: number                 // Final unit price
    totalAmount: number               // Order total
  }
  status: 'pending' | 'in_production' | 'ready' | 'installed' | 'completed' | 'cancelled'
  production: {
    startDate?: Date                  // Production start date
    estimatedCompletion?: Date        // Estimated completion
    actualCompletion?: Date           // Actual completion
    notes?: string                    // Production notes
  }
  installation: {
    scheduledDate?: Date              // Installation date
    completedDate?: Date              // Installation completion
    installerId?: string              // Installer (ObjectId)
    notes?: string                    // Installation notes
  }
  createdAt?: Date                    // Auto-generated
  updatedAt?: Date                    // Auto-generated
  deletedAt?: Date                    // Soft delete timestamp
}
```

#### Order Item Subdocument
```typescript
interface OrderItem {
  product: string                      // Product reference (ObjectId)
  specifications: ProductSpecifications  // Final specifications
  quantity: number                     // Quantity
  unitPrice: number                   // Final unit price
  totalPrice: number                  // Item total
}
```

#### Indexes
```javascript
db.orders.createIndex({ orderNumber: 1 }, { unique: true })
db.orders.createIndex({ quoteId: 1 })
db.orders.createIndex({ customerId: 1 })
db.orders.createIndex({ salespersonId: 1 })
db.orders.createIndex({ status: 1 })
db.orders.createIndex({ deletedAt: 1 })
```

---

## 💬 Communication System

### Chat Rooms Collection
```typescript
interface ChatRoom {
  _id: string                          // ObjectId
  type: 'customer' | 'internal'       // Chat type
  participants: string[]               // Participants (User ObjectIds)
  customer?: string                    // Customer reference (if customer chat)
  title?: string                       // Chat title
  lastMessage?: string                 // Last message preview
  lastMessageAt?: Date                 // Last message timestamp
  isActive: boolean                    // Chat active status
  createdAt?: Date                    // Auto-generated
  updatedAt?: Date                    // Auto-generated
  deletedAt?: Date                    // Soft delete timestamp
}
```

#### Indexes
```javascript
db.chatrooms.createIndex({ participants: 1 })
db.chatrooms.createIndex({ customer: 1 })
db.chatrooms.createIndex({ type: 1 })
db.chatrooms.createIndex({ isActive: 1 })
db.chatrooms.createIndex({ deletedAt: 1 })
```

### Messages Collection
```typescript
interface Message {
  _id: string                          // ObjectId
  chatRoomId: string                  // Chat room reference
  senderId: string                    // Sender (ObjectId)
  content: string                      // Message content
  type: 'text' | 'image' | 'file'     // Message type
  metadata?: {
    fileName?: string                 // File name (if file message)
    fileSize?: number                 // File size
    mimeType?: string                 // File MIME type
  }
  status: 'sent' | 'delivered' | 'read'  // Message status
  readBy?: ReadReceipt[]              // Read receipts
  createdAt?: Date                    // Auto-generated
  updatedAt?: Date                    // Auto-generated
  deletedAt?: Date                    // Soft delete timestamp
}
```

#### Read Receipt Subdocument
```typescript
interface ReadReceipt {
  user: string                        // User (ObjectId)
  readAt: Date                        // Read timestamp
}
```

#### Indexes
```javascript
db.messages.createIndex({ chatRoomId: 1, createdAt: 1 })
db.messages.createIndex({ senderId: 1 })
db.messages.createIndex({ status: 1 })
db.messages.createIndex({ deletedAt: 1 })
```

---

## 🔔 Notification System

### Notifications Collection
```typescript
interface Notification {
  _id: string                          // ObjectId
  recipientId: string                 // Recipient user (ObjectId)
  type: 'appointment' | 'quote' | 'order' | 'message' | 'system'  // Notification type
  title: string                       // Notification title
  body: string                        // Notification body
  data?: Record<string, any>          // Additional data
  channels: {
    push: boolean                     // Send as push notification
    email: boolean                    // Send as email
    inApp: boolean                    // Show in app
  }
  status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed'
  sentAt?: Date                       // Sent timestamp
  readAt?: Date                       // Read timestamp
  failureReason?: string              // Failure reason (if failed)
  createdAt?: Date                    // Auto-generated
  updatedAt?: Date                    // Auto-generated
  deletedAt?: Date                    // Soft delete timestamp
}
```

#### Indexes
```javascript
db.notifications.createIndex({ recipientId: 1, createdAt: -1 })
db.notifications.createIndex({ type: 1 })
db.notifications.createIndex({ status: 1 })
db.notifications.createIndex({ deletedAt: 1 })
```

---

## 📁 File Management

### Uploads Collection
```typescript
interface Upload {
  _id: string                          // ObjectId
  originalName: string                // Original file name
  fileName: string                    // Generated file name
  mimeType: string                    // MIME type
  size: number                        // File size in bytes
  url: string                         // File URL
  path?: string                       // Local file path
  storageType: 'local' | 'cloudinary' | 'aws'  // Storage type
  storageId?: string                  // Cloud storage ID
  uploadedBy?: string                 // Uploader (ObjectId)
  category?: string                   // File category
  metadata?: Record<string, any>      // File metadata
  isPublic: boolean                   // Public access flag
  downloadCount?: number              // Download counter
  createdAt?: Date                    // Auto-generated
  updatedAt?: Date                    // Auto-generated
  deletedAt?: Date                    // Soft delete timestamp
}
```

#### Indexes
```javascript
db.uploads.createIndex({ fileName: 1 })
db.uploads.createIndex({ uploadedBy: 1 })
db.uploads.createIndex({ mimeType: 1 })
db.uploads.createIndex({ category: 1 })
db.uploads.createIndex({ deletedAt: 1 })
```

---

## 📈 Sales Analytics

### Sales Collection
```typescript
interface Sale {
  _id: string                          // ObjectId
  orderId: string                     // Related order (ObjectId)
  customerId: string                  // Customer reference
  salespersonId: string               // Salesperson (ObjectId)
  amount: number                      // Sale amount
  commission?: {
    percentage: number                // Commission percentage
    amount: number                    // Commission amount
  }
  date: Date                          // Sale date
  type: 'new' | 'upgrade' | 'maintenance'  // Sale type
  category?: string                   // Sale category
  region?: string                     // Geographic region
  source?: string                     // Lead source
  notes?: string                      // Additional notes
  createdAt?: Date                    // Auto-generated
  updatedAt?: Date                    // Auto-generated
  deletedAt?: Date                    // Soft delete timestamp
}
```

#### Indexes
```javascript
db.sales.createIndex({ orderId: 1 }, { unique: true })
db.sales.createIndex({ customerId: 1 })
db.sales.createIndex({ salespersonId: 1 })
db.sales.createIndex({ date: 1 })
db.sales.createIndex({ type: 1 })
db.sales.createIndex({ deletedAt: 1 })
```

---

## 🔗 Relationship Diagram

```
Users (Salespersons, Managers, Admins)
│
├── Customers (assignedTo → Users._id)
│   └── Appointments (customerId → Customers._id)
│       └── Quotes (appointmentId → Appointments._id)
│           └── Orders (quoteId → Quotes._id)
│               └── Sales (orderId → Orders._id)
│
├── ChatRooms (participants → Users._id)
│   └── Messages (chatRoomId → ChatRooms._id, senderId → Users._id)
│
├── Notifications (recipientId → Users._id)
│
├── Products (category → Categories._id)
│   └── Quote Items (product → Products._id)
│       └── Order Items (product → Products._id)
│
└── Uploads (uploadedBy → Users._id)
    └── Used in:
        ├── Users.profilePicture
        ├── Products.images
        ├── Quotes.documents
        └── Messages (file attachments)
```

---

## 🔍 Query Patterns

### Common Queries

#### Customer Sales History
```javascript
db.customers.aggregate([
  { $match: { _id: ObjectId("customerId") } },
  {
    $lookup: {
      from: "quotes",
      localField: "_id",
      foreignField: "customerId",
      as: "quotes"
    }
  },
  {
    $lookup: {
      from: "orders",
      localField: "quotes._id",
      foreignField: "quoteId",
      as: "orders"
    }
  }
])
```

#### Salesperson Performance
```javascript
db.sales.aggregate([
  { $match: { salespersonId: ObjectId("userId") } },
  {
    $group: {
      _id: { 
        year: { $year: "$date" },
        month: { $month: "$date" }
      },
      totalSales: { $sum: "$amount" },
      totalOrders: { $sum: 1 }
    }
  },
  { $sort: { "_id.year": -1, "_id.month": -1 } }
])
```

#### Active Users Summary
```javascript
db.users.aggregate([
  { $match: { deletedAt: null } },
  {
    $group: {
      _id: "$role",
      count: { $sum: 1 }
    }
  }
])
```

---

## 📊 Performance Optimization

### Indexing Strategy
1. **Foreign Keys**: All ObjectId references have indexes
2. **Queries**: Common query patterns have compound indexes
3. **Text Search**: Name and description fields have text indexes
4. **Soft Deletes**: All collections have deletedAt indexes

### Query Optimization
1. **Lean Queries**: Use `.lean()` for read-only operations
2. **Projections**: Select only required fields
3. **Pagination**: Implement cursor-based pagination for large datasets
4. **Caching**: Cache frequently accessed data

### Data Validation
1. **Schema Validation**: Mongoose schema validation
2. **Business Rules**: Application-level validation
3. **Data Integrity**: Referential integrity checks
4. **Audit Trail**: Track all data changes

---

## 🔄 Migration & Backup

### Database Migration
```typescript
// Migration example: Add new field to existing documents
db.customers.updateMany(
  { leadSource: { $exists: false } },
  { $set: { leadSource: "unknown" } }
)
```

### Backup Strategy
1. **Daily Backups**: Automated daily backups
2. **Point-in-Time Recovery**: MongoDB Atlas backup system
3. **Development Backups**: Separate development database
4. **Export/Import**: Data export/import utilities

### Scaling Considerations
1. **Read Replicas**: For read-heavy operations
2. **Sharding**: For horizontal scaling
3. **Connection Pooling**: Optimize connection usage
4. **Monitoring**: Database performance monitoring

---

**Last Updated**: [Date]  
**Version**: 1.0  
**Maintained By**: Development Team