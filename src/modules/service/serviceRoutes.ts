import { Router } from 'express'
import { ServiceController } from './serviceController'
import { ServiceService } from './serviceService';
import { ServiceValidator } from './serviceValidator'
import { authenticate } from '../../middlewares/authMiddleware';
import { validate } from '../../common/utils/helpers'

const router = Router()

const serviceService = new ServiceService();
const serviceController = new ServiceController(serviceService)

router.get('/', serviceController.getAll)
router.get('/:id', serviceController.getById)
router.use(authenticate);
router.post('/', validate(ServiceValidator.create), serviceController.create)
router.put('/:id', validate(ServiceValidator.update), serviceController.update)
router.delete('/:id', serviceController.delete)

export default router