import { Router } from 'express'
import { AppointmentController } from './appointmentController'
import { AppointmentService } from './appointmentService';
import { AppointmentValidator } from './appointmentValidator'
import { authenticate } from '../../middlewares/authMiddleware';
import { validate, validateQuery } from '../../common/utils/helpers'
import { requiredRole } from '../../middlewares/authorization';

const router = Router()

const appointmentService = new AppointmentService();
const appointmentController = new AppointmentController(appointmentService)

router.use(authenticate);
router.get('/', requiredRole(['manager', 'salesperson', 'superadmin']), validateQuery(AppointmentValidator.getAll), appointmentController.getAll)
router.get('/manager', requiredRole(['manager', 'superadmin']), validateQuery(AppointmentValidator.getAll), appointmentController.getAppointmentsforManager)
router.get('/:id', requiredRole(['manager', 'salesperson', 'superadmin']), appointmentController.getById)
router.post('/', requiredRole(['manager', 'salesperson', 'superadmin']), validate(AppointmentValidator.create), appointmentController.create)
router.put('/:id', requiredRole(['manager', 'salesperson', 'superadmin']), validate(AppointmentValidator.update), appointmentController.update)
router.delete('/:id', requiredRole(['manager', 'salesperson', 'superadmin']), appointmentController.delete)

export default router