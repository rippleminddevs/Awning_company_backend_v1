import { Router } from 'express'
import { MessageController } from './messageController'
import { MessageService } from './messageService';
import { MessageValidator } from './messageValidator'
import { authenticate } from '../../middlewares/authMiddleware';
import { validate } from '../../common/utils/helpers'
import multer from 'multer';

const upload = multer()
const router = Router()

const messageService = new MessageService();
const messageController = new MessageController(messageService)

router.use(authenticate);
router.get('/', messageController.getAll)
router.get('/:id', messageController.getById)
router.post('/', upload.single('content'), validate(MessageValidator.create), messageController.create)
router.put('/:id', validate(MessageValidator.update), messageController.update)
router.delete('/:id', messageController.delete)

export default router