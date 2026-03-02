import { Router } from 'express'
import { FabricController } from './fabricController'
import { FabricService } from './fabricService';
import { FabricValidator } from './fabricValidator'
import { authenticate } from '../../middlewares/authMiddleware';
import { validate } from '../../common/utils/helpers'

const router = Router()

const fabricService = new FabricService();
const fabricController = new FabricController(fabricService)

router.get('/', fabricController.getAll)
router.get('/:id', fabricController.getById)
router.use(authenticate);
router.post('/', validate(FabricValidator.create), fabricController.create)
router.put('/:id', validate(FabricValidator.update), fabricController.update)
router.delete('/:id', fabricController.delete)

export default router