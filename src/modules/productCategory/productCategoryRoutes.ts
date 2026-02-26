import { Router } from 'express'
import { ProductCategoryController } from './productCategoryController'
import { ProductCategoryService } from './productCategoryService';
import { ProductCategoryValidator } from './productCategoryValidator'
import { authenticate } from '../../middlewares/authMiddleware';
import { validate } from '../../common/utils/helpers'

const router = Router()

const productCategoryService = new ProductCategoryService();
const productCategoryController = new ProductCategoryController(productCategoryService)

router.get('/', productCategoryController.getAll)
router.get('/:id', productCategoryController.getById)
router.use(authenticate);
router.post('/', validate(ProductCategoryValidator.create), productCategoryController.create)
router.put('/:id', validate(ProductCategoryValidator.update), productCategoryController.update)
router.delete('/:id', productCategoryController.delete)

export default router