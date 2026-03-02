import { Router } from 'express'
import { ProductPriceController } from './productPriceController'
import { ProductPriceService } from './productPriceService';
import { ProductPriceValidator } from './productPriceValidator'
import { authenticate } from '../../middlewares/authMiddleware';
import { validate } from '../../common/utils/helpers'

const router = Router()

const productPriceService = new ProductPriceService();
const productPriceController = new ProductPriceController(productPriceService)

router.get('/', productPriceController.getAll)
router.get('/:id', productPriceController.getById)
router.use(authenticate);
router.post('/', validate(ProductPriceValidator.create), productPriceController.create)
router.put('/:id', validate(ProductPriceValidator.update), productPriceController.update)
router.delete('/:id', productPriceController.delete)

export default router