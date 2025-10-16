import { Router } from 'express'
import { UserController } from './userController'
import { validate, validateQuery } from '../../common/utils/helpers'
import { UserValidator } from './userValidator'
import { UserService } from './userService'
import { authenticate } from '../../middlewares/authMiddleware'
import { requiredRole } from '../../middlewares/authorization'
import multer from 'multer';

const upload = multer();
const router = Router()

const userService = new UserService()
const userController = new UserController(userService)

router.use(authenticate)

router.post('/', upload.single('profilePicture'), validate(UserValidator.create), requiredRole(['superadmin']), userController.create)
router.get('/', userController.getAll)
router.put('/', upload.single('profilePicture'), validate(UserValidator.updateOwnProfile), userController.updateOwnProfile);
router.put('/fcm-tokens', validate(UserValidator.updateFCMTokens), userController.updateFCMTokens);
router.get('/sales-persons', requiredRole(['superadmin', 'manager']), validateQuery(UserValidator.getSalesPersons), userController.getSalesPersons);

router.put('/:id', upload.single('profilePicture'), validate(UserValidator.updateUsers), requiredRole(['superadmin']), userController.updateUsers)
router.get('/:id', requiredRole(['superadmin', 'manager']), userController.getUserById)
router.delete('/:id', requiredRole(['superadmin']), userController.delete)

export default router