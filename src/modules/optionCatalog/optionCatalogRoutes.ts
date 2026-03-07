import { Router } from 'express'
import { OptionCatalogController } from './optionCatalogController'
import { OptionCatalogService } from './optionCatalogService';
import { OptionCatalogValidator } from './optionCatalogValidator'
import { authenticate } from '../../middlewares/authMiddleware';
import { validate } from '../../common/utils/helpers'

const router = Router()

const optionCatalogService = new OptionCatalogService();
const optionCatalogController = new OptionCatalogController(optionCatalogService)

router.get('/', optionCatalogController.getAll)
router.get('/:id', optionCatalogController.getById)
router.use(authenticate);
router.post('/', validate(OptionCatalogValidator.create), optionCatalogController.create)
router.put('/:id', validate(OptionCatalogValidator.update), optionCatalogController.update)
router.delete('/:id', optionCatalogController.delete)

export default router