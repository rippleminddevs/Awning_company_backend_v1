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
import trackingRoutes from './modules/tracking/trackingRoutes'
import inventoryRoutes from './modules/inventory/inventoryRoutes'
import integrationRoutes from './modules/integration/integrationRoutes'
import adminRoutes from './modules/admin/adminRoutes'
import contentRoutes from './modules/content/contentRoutes';
import { ContentService } from './modules/content/contentService';
import { apiResponse } from './common/utils/apiResponse';

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
    this.router.use('/inventories', inventoryRoutes)
    this.router.use('/integrations', integrationRoutes)
    this.router.use('/admin', adminRoutes)
    
    // With other route registrations
    this.router.use('/content', contentRoutes);
    
    // App config endpoint - get all content URLs
    this.router.get('/app/config', async (req: any, res: any) => {
      try {
        const contentService = new ContentService();
        const config = await contentService.getAppConfig();
        apiResponse(res, config, 200);
      } catch (error: any) {
        apiResponse(res, error, error.statusCode || 500);
      }
    });

    // {{moduleRoute}}
  }
}

export default new Routes().router
