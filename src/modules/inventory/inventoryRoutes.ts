import { Router } from 'express'
import { ProductController } from '../product/productController'
import { ProductService } from '../product/productService'
import { authenticate } from '../../middlewares/authMiddleware'

const router = Router()
const productService = new ProductService()
const productController = new ProductController(productService)

// Use authentication for inventory endpoints
router.use(authenticate)

// Map /inventories/analytics to the product controller's inventory analytics method
router.get('/analytics', productController.getInventoryAnalytics)

export default router
