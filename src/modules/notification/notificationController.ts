import { BaseController } from '../../common/core/baseController'
import { NotificationService } from './notificationService'
import { GetNotificationParams, Notification } from './notificationInterface'
import { Request, Response } from 'express'
import { apiResponse } from '../../common/utils/apiResponse'

export class NotificationController extends BaseController<Notification, NotificationService> {
  constructor(notificationService: NotificationService) {
    super(notificationService)
  }

  public create = async (req: Request, res: Response) => {

    const createData: any = {
      ...req.body,
      createdBy: req.user!.id
    }
    const notification = await this.service.createNotification(createData)
    return apiResponse(res, notification)
  }

  public getAll = async (req: Request, res: Response) => {
    const params = req.query as unknown as GetNotificationParams;
    const result = await this.service.getAllNotifications(req.user!.id, params);
    return apiResponse(res, result);
  }

  public markAsRead = async (req: Request, res: Response) => {
    const { id: notificationId } = req.params;
    const userId = req.user!.id;

    const notification = await this.service.markAsRead({
      notificationId,
      userId
    });
    return apiResponse(res, notification);
  }
}