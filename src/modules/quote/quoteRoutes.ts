import { Router } from 'express'
import { QuoteController } from './quoteController'
import { QuoteService } from './quoteService';
import { QuoteValidator } from './quoteValidator'
import { authenticate } from '../../middlewares/authMiddleware';
import { validate, validateQuery } from '../../common/utils/helpers'
import multer from 'multer';
import { InvoiceController } from './invoiceController';

const upload = multer()
const router = Router()

const quoteService = new QuoteService();
const quoteController = new QuoteController(quoteService)
const invoiceController = new InvoiceController();

router.get('/:quoteId/invoice', invoiceController.generateInvoice);
router.get('/:quoteId/invoice/download', invoiceController.downloadInvoice);

router.use(authenticate);
router.get('/', validateQuery(QuoteValidator.getAll), quoteController.getAll)
router.post('/', upload.single('checkImage'), validate(QuoteValidator.create), quoteController.create)
router.get('/analytics', quoteController.getSalesPersonAnalytics)
router.post('/documents/:id', upload.array('addDocuments', 10), validate(QuoteValidator.updateDocuments), quoteController.updateDocuments)
router.get('/:id', quoteController.getById)
router.put('/:id', validate(QuoteValidator.update), quoteController.update)
router.delete('/:id', quoteController.delete)

// Invoice Routes

export default router