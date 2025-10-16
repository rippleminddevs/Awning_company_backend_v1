import { Router } from 'express'
import { CustomerController } from './customerController'
import { CustomerService } from './customerService';
import { CustomerValidator } from './customerValidator'
import { authenticate } from '../../middlewares/authMiddleware';
import { validate } from '../../common/utils/helpers'
import {requiredRole} from '../../middlewares/authorization'

const router = Router()

const customerService = new CustomerService();
const customerController = new CustomerController(customerService)

router.use(authenticate);
router.get('/', requiredRole(['superadmin', 'manager']), customerController.getAll)
router.get('/:id', requiredRole(['superadmin', 'manager']), customerController.getById)
router.post('/', validate(CustomerValidator.create), requiredRole(['superadmin', 'manager']), customerController.create)
router.put('/:id', validate(CustomerValidator.update), requiredRole(['superadmin', 'manager']), customerController.update)
router.delete('/:id', requiredRole(['superadmin', 'manager']), customerController.delete)

export default router