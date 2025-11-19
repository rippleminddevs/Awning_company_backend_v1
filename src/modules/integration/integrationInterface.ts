export interface SMTP {
  configName?: string
  from?: string
  host?: string
  port?: number
  email?: string
  password?: string
}

export interface MailChimp {
  apiKey?: string
}

export interface ThirdPartyTool {
  name?: string
  enable?: boolean
}

export interface NotificationSetting {
  reminderAlert?: boolean
  paymentAlert?: boolean
  inventoryAlert?: boolean
}

export interface Integration {
  _id?: string
  smtp?: SMTP
  mailChimp?: MailChimp
  thirdPartyTool?: ThirdPartyTool[]
  notificationSetting?: NotificationSetting
  createdBy: string
  createdAt?: Date
  updatedAt?: Date
}
