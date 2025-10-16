export interface Upload {
  _id: any
  id: string // Unique identifier (MongoDB ObjectId or Sequelize ID)
  filename: string // Stored filename
  originalName: string // Original filename before upload
  size: number // File size in bytes
  mimeType: string // File MIME type (e.g., 'image/png')
  path: string // Storage path (local or cloud)
  url?: string // Public file URL (optional)
  uploadedHost: string // Storage location (e.g., AWS S3, Google Drive)
  isPublic: boolean // Whether the file is publicly accessible
  userId?: string // Associated user ID (optional)
  metadata?: Record<string, any> // Additional metadata (tags, custom properties)
  createdAt: Date // Timestamp when uploaded
  updatedAt: Date // Timestamp when last modified
}
