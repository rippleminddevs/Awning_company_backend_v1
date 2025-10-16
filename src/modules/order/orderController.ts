import { BaseController } from '../../common/core/baseController'
import { OrderService } from './orderService'
import { Order } from './orderInterface'

export class OrderController extends BaseController<Order, OrderService> {
  constructor(orderService: OrderService) {
    super(orderService)
  }
}
