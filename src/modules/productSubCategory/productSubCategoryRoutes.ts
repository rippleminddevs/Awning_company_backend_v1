import { Router } from 'express'
import { ProductSubCategoryController } from './productSubCategoryController'
import { ProductSubCategoryService } from './productSubCategoryService';
import { ProductSubCategoryValidator } from './productSubCategoryValidator'
import { authenticate } from '../../middlewares/authMiddleware';
import { validate } from '../../common/utils/helpers'

const router = Router()

const productSubCategoryService = new ProductSubCategoryService();
const productSubCategoryController = new ProductSubCategoryController(productSubCategoryService)

router.get('/', productSubCategoryController.getAll)
router.get('/:id', productSubCategoryController.getById)
router.use(authenticate);
router.post('/', validate(ProductSubCategoryValidator.create), productSubCategoryController.create)
router.put('/:id', validate(ProductSubCategoryValidator.update), productSubCategoryController.update)
router.delete('/:id', productSubCategoryController.delete)

export default router