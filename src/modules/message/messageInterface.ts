import mongoose from "mongoose"
import { User } from "../user/userInterface"

export enum MessageContentType {
  TEXT = 'text',
  MEDIA = 'media'
}

export interface Message {
  _id: mongoose.Types.ObjectId;
  chatId: mongoose.Types.ObjectId;
  sender: Partial<User> | mongoose.Types.ObjectId;
  content: string;
  content_type: MessageContentType;
  mediaType?: string;
  readBy: string[]
  createdAt: Date,
  updatedAt: Date
}

export interface CreateMessageInput extends Partial<Message> {
  userId: string;      
  authUserId: string;   
}