import { BaseService } from '../../common/core/baseService';
import { OrderModel } from './orderModel';
import { Order } from './orderInterface';

export class OrderService extends BaseService<Order> {
  constructor() {
    super(OrderModel.getInstance());
  }

  public createOrder = async (orderData:any): Promise<Order> => {
    try {
      const processedData = this.processOrderData(orderData);
      return await this.model.create(processedData);
    } catch (error) {
      console.error('Failed to create order:', error);
      throw new Error('Failed to create order');
    }
  };

  public updateOrder = async (id: string, orderData: Partial<any>): Promise<Order | null> => {
    try {
      const processedData = this.processOrderData(orderData);
      return await this.model.update(id, processedData);
    } catch (error) {
      console.error(`Failed to update order ${id}:`, error);
      throw new Error('Failed to update order');
    }
  };

  public deleteOrdersByQuoteId = async (quoteId: string): Promise<{ deletedCount: number }> => {
    try {
      return await this.model.deleteMany({ quoteId });
    } catch (error) {
      console.error(`Failed to delete orders for quote ${quoteId}:`, error);
      throw new Error('Failed to delete orders');
    }
  };

  public getOrdersByQuoteId = async (quoteId: string): Promise<Order[]> => {
    try {
      const orders = await this.model.getMongooseModel()?.find({ quoteId: quoteId });
      return orders;
    } catch (error) {
      console.error(`Failed to get orders for quote ${quoteId}:`, error);
      throw new Error('Failed to fetch orders');
    }
  };

  private processOrderData<T extends Partial<Order>>(data: T): T {
    const processedData = { ...data };
    const numberFields = ['width_ft', 'width_in', 'height_ft', 'height_in', 'projection_ft', 'projection_in'] as const;

    numberFields.forEach(field => {
      if (field in processedData && processedData[field] !== undefined) {
        processedData[field] = Number(processedData[field]) || 0;
      }
    });

    return processedData;
  }
}