import { Router } from 'express'
import { ChatController } from './chatController'
import { ChatService } from './chatService';
import { ChatValidator } from './chatValidator'
import { authenticate } from '../../middlewares/authMiddleware';
import { validate } from '../../common/utils/helpers'
import { requiredRole } from '../../middlewares/authorization';

const router = Router()

const chatService = new ChatService();
const chatController = new ChatController(chatService)

router.use(authenticate);
router.get('/', requiredRole(['superadmin', 'manager', 'salesperson']), chatController.getAll)
router.get('/:id', requiredRole(['superadmin', 'manager', 'salesperson']), chatController.getById)
router.post('/', requiredRole(['superadmin', 'manager', 'salesperson']), validate(ChatValidator.create), chatController.create)
router.put('/:id', requiredRole(['superadmin', 'manager', 'salesperson']), validate(ChatValidator.update), chatController.update)
router.delete('/:id', requiredRole(['superadmin', 'manager', 'salesperson']), chatController.delete)

export default router