import { Router } from 'express'
import { ProductController } from './productController'
import { ProductService } from './productService';
import { ProductValidator } from './productValidator'
import { authenticate } from '../../middlewares/authMiddleware';
import { validate, validateQuery } from '../../common/utils/helpers'
import { requiredRole } from '../../middlewares/authorization';
import multer from 'multer'

const upload = multer();
const router = Router()

const productService = new ProductService();
const productController = new ProductController(productService)

router.use(authenticate);
router.get('/', validateQuery(ProductValidator.getProducts), productController.getAll)
router.post('/', upload.single('image'), validate(ProductValidator.create), requiredRole(['superadmin']), productController.create)
router.get('/search', validateQuery(ProductValidator.searchProducts), productController.search)
router.get('/:id', productController.getById)
router.put('/:id', upload.single('image'), validate(ProductValidator.update), requiredRole(['superadmin']), productController.update)
router.delete('/:id', requiredRole(['superadmin']), productController.delete)

export default router