import { Router } from 'express'
import { SaleController } from '../sale/saleController'
import { SaleService } from '../sale/saleService'
import { authenticate } from '../../middlewares/authMiddleware'
import { requiredRole } from '../../middlewares/authorization'

const router = Router()
const saleService = new SaleService()
const saleController = new SaleController(saleService)

// Use authentication and admin role requirement for admin endpoints
router.use(authenticate)
router.use(requiredRole(['superadmin', 'manager']))

export default router
