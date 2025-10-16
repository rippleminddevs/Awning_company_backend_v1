import { BaseController } from '../../common/core/baseController'
import { MessageService } from './messageService'
import { Message } from './messageInterface'
import { apiResponse } from '../../common/utils/apiResponse';
import { Request, Response } from 'express';
import {UploadService} from '../upload/uploadService';

export class MessageController extends BaseController<Message, MessageService> {
  private uploadService: UploadService;
  constructor(messageService: MessageService) {
    super(messageService)
    this.uploadService = new UploadService()
  }

  public create = async (req: Request, res: Response): Promise<void> => {
    const { userId, ...rest } = req.body;
    const authUserId = req.user!.id;

    if (rest.content_type == 'media') {
      const { url } = await this.uploadService.create({
        file: req.file!,
        userId: authUserId,
      });
      rest.content = url;
      rest.mediaType = req.file!.mimetype;
    }

    const data = await this.service.createMessage({
      ...rest,
      userId,
      authUserId
    });

    apiResponse(res, data, 201);
  };

  public getAll = async (req: Request, res: Response): Promise<void> => {
    const params = {
      userId: req.user!.id,
      ...req.query
    }
    const messages = await this.service.getAllMessages(params);
    apiResponse(res, messages, 200);
  };
}
