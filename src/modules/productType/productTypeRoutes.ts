import { Router } from 'express'
import { ProductTypeController } from './productTypeController'
import { ProductTypeService } from './productTypeService';
import { ProductTypeValidator } from './productTypeValidator'
import { authenticate } from '../../middlewares/authMiddleware';
import { validate } from '../../common/utils/helpers'

const router = Router()

const productTypeService = new ProductTypeService();
const productTypeController = new ProductTypeController(productTypeService)

router.get('/', productTypeController.getAll)
router.get('/:id', productTypeController.getById)
router.use(authenticate);
router.post('/', validate(ProductTypeValidator.create), productTypeController.create)
router.put('/:id', validate(ProductTypeValidator.update), productTypeController.update)
router.delete('/:id', productTypeController.delete)

export default router