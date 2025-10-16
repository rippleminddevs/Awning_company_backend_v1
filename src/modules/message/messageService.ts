import { BaseService } from '../../common/core/baseService';
import { MessageModel } from './messageModel';
import { CreateMessageInput, Message } from './messageInterface';
import {
  DEFAULT_PAGINATION_OPTIONS,
  PaginatedResponse,
} from '../../common/interfaces/globalInterfaces';
import { buildPaginationMeta, getPaginationParams } from '../../common/utils/helpers';
import mongoose from 'mongoose';
import { ChatService } from '../chat/chatService';
import socketService from '../../services/socketService';
import { AppError } from '../../common/utils/appError';
import { ChatModel } from '../chat/chatModel'
import { UserModel } from '../user/userModel'
import pushNotificationService from '../../services/pushNotificationService'

export class MessageService extends BaseService<Message> {
  private chatService: ChatService;
  private socketService: typeof socketService
  private chatModel: ChatModel
  private userModel: UserModel
  private pushNotificationService: typeof pushNotificationService

  constructor() {
    super(MessageModel.getInstance());
    this.chatService = new ChatService();
    this.socketService = socketService
    this.chatModel = ChatModel.getInstance()
    this.userModel = UserModel.getInstance()
    this.pushNotificationService = pushNotificationService
  }

  public getAllMessages = async (params: any = {}): Promise<Message[] | PaginatedResponse<Message>> => {
    const page = params.page || DEFAULT_PAGINATION_OPTIONS.page;
    const perPage = params.perPage || DEFAULT_PAGINATION_OPTIONS.perPage;
    const paginate = params.paginate === 'true' || params.paginate === true;

    const userId = new mongoose.Types.ObjectId(params.userId);
    const messageModel = this.model.getMongooseModel();

    if (!params.chatId) {
      return [];
    }

    const chat = await this.chatService.getOne({
      _id: params.chatId,
      participants: { $all: [userId] },
    });

    if (!chat) {
      return [];
    }

    const filter = { chatId: chat._id };
    await messageModel.updateMany(
      {
        chatId: chat._id,
        readBy: { $ne: userId }
      },
      {
        $push: { readBy: userId },
        $set: { updatedAt: new Date() }
      }
    );

    if (paginate) {
      const { skip, limit } = getPaginationParams({ page, perPage });

      const [result, totalCount] = await Promise.all([
        messageModel
          .find(filter)
          .skip(skip)
          .limit(limit)
          .populate({
            path: 'sender',
            model: 'User',
            select: '_id name email profilePicture',
            populate: {
              path: 'profilePicture',
              model: 'Upload',
              select: 'url',
            },
          })
          .lean(),
        messageModel.countDocuments(filter),
      ]);
      result.map((message: any) => {
        message.sender.profilePicture = message.sender.profilePicture?.url || null;
      });
      return {
        result,
        pagination: buildPaginationMeta(totalCount, page, perPage),
      };
    }
    
    const result = await messageModel
      .find(filter)
      .populate({
        path: 'sender',
        model: 'User',
        select: '_id name email profilePicture',
        populate: {
          path: 'profilePicture',
          model: 'Upload',
          select: 'url',
        },
      })
      .lean();
      result.map((message: any) => {
        message.sender.profilePicture = message.sender.profilePicture?.url || null;
      });
      return result;
  };

  public getById = async (id: string): Promise<Message> => {
    const messageModel = this.model.getMongooseModel();
    const result = await messageModel
      .findById(id)
      .populate({
        path: 'sender',
        model: 'User',
        select: '_id name email profilePicture',
        populate: {
          path: 'profilePicture',
          model: 'Upload',
          select: 'url',
        },
      })
      .lean();
    result.sender.profilePicture = result.sender.profilePicture?.url || null;
    return result;
  };

  public createMessage = async (data: CreateMessageInput): Promise<Message> => {
    const authUserId = data.authUserId;

    if (!data.userId && !data.chatId) {
      throw new Error("Either userId or chatId must be provided");
    }

    let chat;

    if (data.chatId) {
      // Case 1: chatId is provided
      chat = await this.chatService.getChatById({
        id: data.chatId.toString(),
        userId: authUserId.toString(),
      });

      if (!chat) {
        throw new Error("Chat not found");
      }
    } else if (data.userId) {
      // Case 2: userId is provided
      const userId = data.userId;
      const participants = [authUserId, userId];

      chat = await this.chatService.getOne({
        participants: { $all: participants },
      });

      if (!chat) {
        chat = await this.chatService.create({
          participants,
          createdBy: authUserId,
        });
      }
    }

    // Create message
    const createdMessage = await this.model.create({
      chatId: chat?._id,
      content_type: data.content_type,
      mediaType: data.mediaType,
      content: data.content,
      sender: authUserId,
      readBy: [authUserId],
    });

    // Update chat last message
    await this.chatService.update(chat!._id.toString(), {
      lastMessage: createdMessage._id,
    });

    // Broadcast via socket
    const io = socketService.getIO();
    const message = await this.getById(createdMessage._id);

    for (const participant of chat?.participants || []) {
      const participantChat = await this.chatService.getChatById({
        id: chat!._id.toString(),
        userId: participant.toString(),
      });

      io.to(`user_${participant.toString()}`).emit("messageReceived", message);
      io.to(`user_${participant.toString()}`).emit("updatedChat", participantChat);
    }

    // Send push notification to the other participant
    const otherParticipant = chat?.participants?.find(
      (participant: any) => participant.toString() !== authUserId.toString()
    );

    if (otherParticipant) {
      const notificationContent = message.content_type === 'media'
        ? 'Sent an image'
        : message.content;
      await this.sendPushNotification(chat!._id.toString(), authUserId.toString(), otherParticipant.toString(), notificationContent);
    }

    return message;
  };

  public async getUnreadCount(chatId: string, userId: string): Promise<number> {
    const mongoose = require('mongoose')

    return await this.model.getMongooseModel().count({
      chatId: new mongoose.Types.ObjectId(chatId),
      sender: { $ne: new mongoose.Types.ObjectId(userId) },
      'readBy': { $ne: new mongoose.Types.ObjectId(userId) },
      deletedAt: null
    })
  }

  public async markMessageAsRead(messageId: string, userId: string): Promise<{ message: string }> {
    const message = await this.getById(messageId)
    if (!message) {
      throw AppError.notFound('Message not found')
    }

    // Check if user is participant in the chat
    const chat = await this.chatModel.getById(message.chatId.toString())
    if (!chat) {
      throw AppError.notFound('Chat not found')
    }

    const isParticipant = chat.participants.some(
      (participantId: any) => participantId.toString() === userId
    )

    if (!isParticipant) {
      throw AppError.forbidden('You are not a participant in this chat')
    }

    // Mark as read
    await this.model.getMongooseModel()?.updateOne(
      {
        _id: new mongoose.Types.ObjectId(messageId),
        'readBy.user': { $ne: new mongoose.Types.ObjectId(userId) }
      },
      {
        $push: {
          readBy: {
            user: new mongoose.Types.ObjectId(userId),
            readAt: new Date()
          }
        },
        $set: { status: 'read' }
      }
    )

    // Send real-time read receipt
    this.socketService.getIO().to(`chat_${message.chatId}`).emit('messageRead', {
      messageId,
      readBy: userId,
      readAt: new Date()
    })

    return { message: 'Message marked as read' }
  }

  private async sendPushNotification(chatId: string, senderId: string, receiverId: string, content: string): Promise<void> {
    try {
      const sender = await this.userModel.getById(senderId)
      const senderName = sender?.name || 'Someone'

      await this.pushNotificationService.sendToUsers(
        [receiverId],
        'New Message',
        `${senderName}: ${content.length > 50 ? content.substring(0, 50) + '...' : content}`,
        {
          chatId: chatId
        }
      )
    } catch (error) {
      // Silent fail for push notifications
      console.error('Failed to send push notification:', error)
    }
  }

}
