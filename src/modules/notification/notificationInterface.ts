export interface Notification {
  _id?: string
  type: 'Appointment' | 'New-Appointment'
  refType: 'Appointment'
  refId: string
  targets: string[]
  readBy: string[]
  data?: Record<string, any>
  createdBy?: string
}

export interface CreateNotificationParam {
  type: 'Appointment' | 'New-Appointment'
  refType: 'Appointment'
  refId: string
  targets: string[]
  data?: Record<string, any>
  sendPush?: boolean
  createdBy?: string
}

export interface NotificationMessage {
  title: string;
  body: string;
}

export interface GenerateMessageParams {
  type: Notification['type'];
  refType?: Notification['refType'];
  createdBy?: {
    name: string;
  };
  refData?: any;
}

export interface GetNotificationParams {
  paginate: boolean
  page?: number
  perPage?: number
}

export interface MarkAsReadParams {
  notificationId: string;
  userId: string;
}