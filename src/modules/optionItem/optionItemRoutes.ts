import { Router } from 'express'
import { OptionItemController } from './optionItemController'
import { OptionItemService } from './optionItemService'
import { OptionItemValidator } from './optionItemValidator'
import { authenticate } from '../../middlewares/authMiddleware'
import { validate } from '../../common/utils/helpers'

// mergeParams: true so /:groupId is accessible from parent router
const router = Router({ mergeParams: true })

const optionItemService = new OptionItemService()
const optionItemController = new OptionItemController(optionItemService)

router.get('/', optionItemController.getByGroup)
router.use(authenticate)
router.post('/', validate(OptionItemValidator.create), optionItemController.createForGroup)
router.put('/:itemId', validate(OptionItemValidator.update), optionItemController.updateForGroup)
router.delete('/:itemId', optionItemController.deleteForGroup)

export default router
