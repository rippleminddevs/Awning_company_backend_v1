import { Router } from 'express'
import { SaleController } from './saleController'
import { SaleService } from './saleService';
import { SaleValidator } from './saleValidator'
import { authenticate } from '../../middlewares/authMiddleware';
import { validate, validateQuery } from '../../common/utils/helpers'

const router = Router()

const saleService = new SaleService();
const saleController = new SaleController(saleService)

router.use(authenticate);
router.get('/overview', validateQuery(SaleValidator.getSalesOverview), saleController.getSalesOverview)
router.get('/representatives', validateQuery(SaleValidator.getSalesRepresentatives), saleController.getSalesRepresentatives)
router.get('/orders', validateQuery(SaleValidator.getCurrentOrders), saleController.getCurrentOrders);
router.get('/report/:salePersonId', validateQuery(SaleValidator.getSalesReport), saleController.getSalesReport)
router.post('/download/:salePersonId', saleController.downloadSalesReport)
router.get('/dashboard', validateQuery(SaleValidator.getDashboardAnalytics), saleController.getDashboardAnalytics)

router.post('/', validate(SaleValidator.create), saleController.create)
router.put('/:id', validate(SaleValidator.update), saleController.update)
router.delete('/:id', saleController.delete)

export default router