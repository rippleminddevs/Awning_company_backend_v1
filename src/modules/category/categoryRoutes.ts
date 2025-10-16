import { Router } from 'express'
import { CategoryController } from './categoryController'
import { CategoryService } from './categoryService';
import { CategoryValidator } from './categoryValidator'
import { authenticate } from '../../middlewares/authMiddleware';
import { validate } from '../../common/utils/helpers'

const router = Router()

const categoryService = new CategoryService();
const categoryController = new CategoryController(categoryService)

router.use(authenticate);
router.get('/', categoryController.getAll)
router.get('/:id', categoryController.getById)
router.post('/', validate(CategoryValidator.create), categoryController.create)
router.put('/:id', validate(CategoryValidator.update), categoryController.update)
router.delete('/:id', categoryController.delete)

export default router