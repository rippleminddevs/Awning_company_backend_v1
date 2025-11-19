import express from 'express'
import { TrackingController } from './trackingController'
import { validateQuery } from '../../common/utils/helpers'
import { TrackingValidator } from './trackingValidator'

const router = express.Router()
const trackingController = new TrackingController()

// GET /api/tracking/dashboard - Get tracking dashboard analytics
router.get(
  '/dashboard',
  validateQuery(TrackingValidator.getTrackingDashboard),
  trackingController.getTrackingDashboard
)

export default router
