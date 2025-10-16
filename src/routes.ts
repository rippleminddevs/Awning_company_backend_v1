import { Router } from 'express'
import userRoutes from './modules/user/userRoutes'
import authRoutes from './modules/auth/authRoutes'
import uploadRoutes from './modules/upload/uploadRoutes'

import customerRoutes from './modules/customer/customerRoutes'
import serviceRoutes from './modules/service/serviceRoutes'
import categoryRoutes from './modules/category/categoryRoutes'
import productRoutes from './modules/product/productRoutes'
import appointmentRoutes from './modules/appointment/appointmentRoutes'
import quoteRoutes from './modules/quote/quoteRoutes'
import orderRoutes from './modules/order/orderRoutes'
import chatRoutes from './modules/chat/chatRoutes'
import messageRoutes from './modules/message/messageRoutes'
import notificationRoutes from './modules/notification/notificationRoutes'
import saleRoutes from './modules/sale/saleRoutes'
// {{modulePath}}

class Routes {
  public router: Router

  constructor() {
    this.router = Router()
    this.configureRoutes()
  }

  private configureRoutes(): void {
    this.router.use('/users', userRoutes)
    this.router.use('/auth', authRoutes)
    this.router.use('/uploads', uploadRoutes)

    this.router.use('/customers', customerRoutes)
    this.router.use('/services', serviceRoutes)
    this.router.use('/categories', categoryRoutes)
    this.router.use('/products', productRoutes)
    this.router.use('/appointments', appointmentRoutes)
    this.router.use('/quotes', quoteRoutes)
    this.router.use('/orders', orderRoutes)
    this.router.use('/chats', chatRoutes)
    this.router.use('/messages', messageRoutes)
    this.router.use('/notifications', notificationRoutes)
    this.router.use('/sales', saleRoutes)
    // {{moduleRoute}}
  }
}

export default new Routes().router
