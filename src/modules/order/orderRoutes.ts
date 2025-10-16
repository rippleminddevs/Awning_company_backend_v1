import { Router } from 'express'
import { OrderController } from './orderController'
import { OrderService } from './orderService';
import { OrderValidator } from './orderValidator'
import { authenticate } from '../../middlewares/authMiddleware';
import { validate } from '../../common/utils/helpers'

const router = Router()

const orderService = new OrderService();
const orderController = new OrderController(orderService)

router.get('/', orderController.getAll)
router.get('/:id', orderController.getById)
router.use(authenticate);
router.post('/', validate(OrderValidator.create), orderController.create)
router.put('/:id', validate(OrderValidator.update), orderController.update)
router.delete('/:id', orderController.delete)

export default router