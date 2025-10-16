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
    const authUser = req.user;
    const chats = await this.service.getAllChats({ ...req.query, userId: authUser!.id })
    apiResponse(res, chats, 200)
  }

  public getById = async (req: Request, res: Response): Promise<void> => {
    const authUser = req.user;
    const chats = await this.service.getChatById({
      id: req.params.id,
      userId: authUser!.id
    })
    apiResponse(res, chats, 200)
  }

  public create = async (req: Request, res: Response): Promise<void> => {
    const authUser = req.user;
    const { userId } = req.body;

    // Create participants array
    const participants = [userId, authUser!.id];

    const chat = await this.service.createChat(participants, authUser!.id);
    apiResponse(res, chat, 201);
  };
}
