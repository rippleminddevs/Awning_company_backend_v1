import { Router } from 'express'
import multer from 'multer'
import { UploadController } from './uploadController'
import { authenticate } from '../../middlewares/authMiddleware'
import { UploadService } from './uploadService'

const router = Router()

const uploadService = new UploadService()
const uploadController = new UploadController(uploadService)

const upload = multer()

router.get('/', uploadController.getAll)
router.get('/:id', uploadController.getById)
router.use(authenticate)
router.post('/', upload.single('file'), uploadController.create)
router.put('/:id', uploadController.update)
router.delete('/:id', uploadController.delete)

export default router
