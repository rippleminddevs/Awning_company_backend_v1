import { Router } from 'express'
import { NotificationController } from './notificationController'
import { NotificationService } from './notificationService';
import { NotificationValidator } from './notificationValidator'
import { authenticate } from '../../middlewares/authMiddleware';
import { validate } from '../../common/utils/helpers'
import {requiredRole} from '../../middlewares/authorization'

const router = Router()

const notificationService = new NotificationService();
const notificationController = new NotificationController(notificationService)

router.use(authenticate);
router.get('/', requiredRole(['superadmin', 'manager', 'salesperson']), notificationController.getAll)
router.get('/:id', requiredRole(['superadmin', 'manager', 'salesperson']), notificationController.getById)
router.post('/', requiredRole(['superadmin', 'manager', 'salesperson']), validate(NotificationValidator.create), notificationController.create)
router.put('/:id', requiredRole(['superadmin', 'manager', 'salesperson']), validate(NotificationValidator.update), notificationController.update)
router.delete('/:id', requiredRole(['superadmin', 'manager', 'salesperson']), notificationController.delete)

export default router