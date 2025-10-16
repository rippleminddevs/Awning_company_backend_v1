import { Request } from 'express'

declare module 'express' {
  interface Request {
    userIp?: string
    user?: {
      [key: string]: any
    }
  }
}
