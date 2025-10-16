export interface Chat {
  _id: string
  participants: string[]
  lastMessage: string
  createdBy: string
  createdAt: Date
  updatedAt: Date
  deletedAt: null | Date
}

export interface SendMessage {
  authUserId: string
  userId: string
  content: string
  content_type: string
}