import { BaseController } from '../../common/core/baseController'
import { ChatService } from './chatService'
import { Chat } from './chatInterface'
import { Request, Response } from 'express';
import { apiResponse } from '../../common/utils/apiResponse';

export class ChatController extends BaseController<Chat, ChatService> {
  constructor(chatService: ChatService) {
    super(chatService)
  }

  public getAll = async (req: Request, res: Response): Promise<void> => {
    if (!req.user || !req.user.id) {
      throw new Error('User not found');
    }
    const userId = req.user.id;
    const chats = await this.service.getAllChats({ ...req.query, userId })
    apiResponse(res, chats, 200)
  }

  public getById = async (req: Request, res: Response): Promise<void> => {
    if (!req.user || !req.user.id) {
      throw new Error('User not found');
    }
    const userId = req.user.id;
    const chats = await this.service.getChatById({
      id: req.params.id,
      userId
    })
    apiResponse(res, chats, 200)
  }

  public create = async (req: Request, res: Response): Promise<void> => {
    if (!req.user || !req.user.id) {
      throw new Error('User not found');
    }
    const authUserId = req.user.id;
    const { userId } = req.body;

    // Create participants array
    const participants = [userId, authUserId];

    const chat = await this.service.createChat(participants, authUserId);
    apiResponse(res, chat, 201);
  };
}
