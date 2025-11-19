import { Router } from 'express'
import { IntegrationController } from './integrationController'
import { IntegrationService } from './integrationService';
import { IntegrationValidator } from './integrationValidator'
import { authenticate } from '../../middlewares/authMiddleware';
import { validate } from '../../common/utils/helpers'
import { requiredRole } from '../../middlewares/authorization';

const router = Router()

const integrationService = new IntegrationService();
const integrationController = new IntegrationController(integrationService)

router.use(authenticate);
router.get('/', requiredRole(['superadmin']), integrationController.getAll)
router.get('/:id', requiredRole(['superadmin']), integrationController.getById)
router.post('/smtp', validate(IntegrationValidator.createSMTP), requiredRole(['superadmin']), integrationController.createSMTP)
router.post('/mailchimp', validate(IntegrationValidator.createMailChimp), requiredRole(['superadmin']), integrationController.createMailChimp)
router.post('/tools', validate(IntegrationValidator.createThirdPartyTool), requiredRole(['superadmin']), integrationController.createThirdPartyTool)
router.post('/notifications', validate(IntegrationValidator.createNotificationSetting), requiredRole(['superadmin']), integrationController.createNotificationSetting)
router.put('/:id', validate(IntegrationValidator.update), requiredRole(['superadmin']), integrationController.update)
router.delete('/:id', requiredRole(['superadmin']), integrationController.delete)
export default router
