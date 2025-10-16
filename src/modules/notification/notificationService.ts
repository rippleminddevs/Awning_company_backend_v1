import { BaseService } from '../../common/core/baseService'
import { NotificationModel } from './notificationModel'
import { CreateNotificationParam, GenerateMessageParams, GetNotificationParams, MarkAsReadParams, Notification, NotificationMessage } from './notificationInterface'
import socketService from '../../services/socketService';
import pushNotificationService from '../../services/pushNotificationService'

export class NotificationService extends BaseService<Notification> {
  constructor() {
    super(NotificationModel.getInstance())
  }

  // Helper to get the correct model based on refType
  private getRefModel(refType: string) {
    const models = {
      Appointment: this.model.getMongooseModel().model('Appointment'),
    };
    return models[refType as keyof typeof models];
  }

  // Get notification populated fields
  private async getPopulatedNotification(id: string): Promise<(Notification & NotificationMessage) | null> {
    const notification = await this.model.getMongooseModel()
      .findById(id)
      .populate({
        path: 'createdBy',
        select: 'name email',
        model: 'User',
        populate: {
          path: 'profilePicture',
          select: 'url',
          model: 'Upload'
        }
      })
      .lean();

    if (!notification) return null;

    if (notification.createdBy?.profilePicture?.url) {
      notification.createdBy.profilePicture =
        notification.createdBy.profilePicture.url;
    }

    // Populate refData based on refType
    if (notification.refType && notification.refId) {
      const refModel = this.getRefModel(notification.refType);
      if (refModel) {
        try {
          if (notification.refType === 'Appointment') {
            const appointment = await refModel
              .findById(notification.refId)
              .select('firstName lastName date time')
              .lean();

            notification.refData = {
              _id: appointment?._id,
              firstName: appointment?.firstName,
              lastName: appointment?.lastName,
              date: appointment?.date,
              time: appointment?.time,
            };
          }
        } catch (error) {
          notification.refData = { _id: notification.refId };
        }
        if (notification.refData?.user?.profilePicture?.url) {
          notification.refData.user.profilePicture = notification.refData.user.profilePicture.url;
        }
      }
    }

    // Add generated message to the notification
    const { title, body } = this.generateMessage({
      type: notification.type,
      refData: notification.refData
    });

    return {
      ...notification,
      title,
      body
    };
  }

  // Create notification
  public createNotification = async (notificationParams: CreateNotificationParam) => {
    const { sendPush, ...notificationData } = notificationParams;

    const notificationResult = await this.model.create(notificationData);
    if (!notificationResult) {
      return notificationResult;
    }

    // Emit new notification event
    const io = socketService.getIO();
    notificationData.targets.forEach((target: string) => {
      io.to(`user_${target}`).emit('new_notification', {
        newNotification: true
      });
    });

    // Get populated notification with generated message
    const populatedNotification = await this.getPopulatedNotification(notificationResult._id.toString());
    if (!populatedNotification) {
      return null;
    }

    // Send push notification if requested
    if (sendPush === true && populatedNotification) {
      const { targets, title, body } = populatedNotification;

      if (Array.isArray(targets) && targets.length > 0 && title && body) {
        try {
          await pushNotificationService.sendToUsers(
            targets,
            title,
            body,
            {
              type: populatedNotification.type,
              refType: populatedNotification.refType,
              refId: populatedNotification.refId
            }
          );

        } catch (error) {
          console.error('Failed to send push notification:', error);
        }
      }
    }

    return populatedNotification;
  }

  // Generate message dynamically
  private generateMessage(params: GenerateMessageParams): NotificationMessage {
    const { type, refData } = params;
    let title = 'New Notification';
    let body = 'You have a new notification';

    switch (type) {
      case 'Appointment':
        title = 'Appointment';
        body = `Your appointment is scheduled today at ${refData?.time.toLocaleDateString()} for ${refData?.firstName} ${refData?.lastName}`;
        break;

      case 'New-Appointment':
        title = 'New Appointment';
        body = `You have been assigned a new appointment at ${refData?.date.toLocaleDateString()} ${refData?.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} for ${refData?.firstName} ${refData?.lastName}`;
        break;

      default:
        break;
    }

    return { title, body };
  }

  // Get notifications
  public getAllNotifications = async (userId: string, params: GetNotificationParams) => {
    const query: any = {
      targets: userId,
      ...params
    };

    const result = await this.model.getAll(query);

    // paginated response
    if (result && 'result' in result && 'pagination' in result) {
      const populatedResults = await Promise.all(
        result.result.map((notification: any) =>
          this.getPopulatedNotification(notification._id.toString())
        )
      );

      return {
        result: populatedResults.filter(Boolean),
        pagination: result.pagination
      };
    }

    // non-paginated response
    if (Array.isArray(result)) {
      const populatedResults = await Promise.all(
        result.map((notification: any) =>
          this.getPopulatedNotification(notification._id.toString())
        )
      );
      return populatedResults.filter(Boolean);
    }

    return [];
  };
  
  // Mark notification as read
  public markAsRead = async (params: MarkAsReadParams): Promise<Notification | null> => {
    const { notificationId, userId } = params;

    const notification = await this.model.getMongooseModel()
      .findOne({
        _id: notificationId,
        $or: [
          { targets: userId },
          { createdBy: userId }
        ]
      });

    if (!notification) {
      throw new Error('Notification not found or user is not a target');
    }

    if (!notification.readBy.includes(userId)) {
      notification.readBy.push(userId);
      await notification.save();
    }

    return notification;
  }

}