import { Router } from 'express'
import { InventoryController } from './inventoryController'
import { InventoryService } from './inventoryService';
import { InventoryValidator } from './inventoryValidator'
import { authenticate } from '../../middlewares/authMiddleware';
import { validate } from '../../common/utils/helpers'
import { requiredRole } from '../../middlewares/authorization';

const router = Router()

const inventoryService = new InventoryService();
const inventoryController = new InventoryController(inventoryService)

router.use(authenticate);

router.get('/', requiredRole(['superadmin']), inventoryController.getAll)
router.get('/analytics', requiredRole(['superadmin']), inventoryController.getAnalytics)
router.get('/:id', requiredRole(['superadmin']), inventoryController.getById)

router.post('/', validate(InventoryValidator.create), requiredRole(['superadmin']), inventoryController.create)
router.put('/:id', validate(InventoryValidator.update), requiredRole(['superadmin']), inventoryController.update)
router.delete('/:id', requiredRole(['superadmin']), inventoryController.delete)

export default router