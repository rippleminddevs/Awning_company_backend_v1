import { Router } from 'express'
import { OptionGroupController } from './optionGroupController'
import { OptionGroupService } from './optionGroupService';
import { OptionGroupValidator } from './optionGroupValidator'
import { authenticate } from '../../middlewares/authMiddleware';
import { validate } from '../../common/utils/helpers'

const router = Router()

const optionGroupService = new OptionGroupService();
const optionGroupController = new OptionGroupController(optionGroupService)

router.get('/', optionGroupController.getAll)
router.get('/:id', optionGroupController.getById)
router.use(authenticate);
router.post('/', validate(OptionGroupValidator.create), optionGroupController.create)
router.put('/:id', validate(OptionGroupValidator.update), optionGroupController.update)
router.delete('/:id', optionGroupController.delete)

export default router