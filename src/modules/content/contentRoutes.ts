import { Router } from 'express';
import { ContentController } from './contentController';
import { ContentValidator } from './contentValidator';
import { validate, validateParams, validateQuery } from '../../common/utils/helpers';
import { authenticate } from '../../middlewares/authMiddleware';
// {{modulePath}}

const router = Router();

const contentController = new ContentController();

// ============================================
// Public Routes (No Auth Required)
// ============================================

// Get About App content
router.get('/about', contentController.getAboutContent);

// Get Privacy Policy content
router.get('/privacy', contentController.getPrivacyContent);

// Get Terms & Conditions content
router.get('/terms', contentController.getTermsContent);

// Get all FAQs
router.get('/faqs', contentController.getFAQs);

// Get all app config URLs
router.get('/app/config', contentController.getAppConfig);

// ============================================
// Admin Routes (Auth Required)
// ============================================

// All admin routes require authentication
router.use(authenticate);

// Get all FAQs for admin (with pagination)
router.get(
  '/admin/faqs',
  validateQuery(ContentValidator.listFAQs),
  contentController.getAllFAQsForAdmin
);

// Create new FAQ
router.post('/admin/faqs', validate(ContentValidator.createFAQ), contentController.createFAQ);

// Update FAQ
router.put(
  '/admin/faqs/:id',
  validateParams(ContentValidator.faqIdParam),
  validate(ContentValidator.updateFAQ),
  contentController.updateFAQ
);

// Delete FAQ
router.delete(
  '/admin/faqs/:id',
  validateParams(ContentValidator.faqIdParam),
  contentController.deleteFAQ
);

// Update About section
router.put(
  '/admin/about',
  validate(ContentValidator.updateAbout),
  contentController.updateAboutSection
);

// Update Privacy Policy section
router.put(
  '/admin/privacy',
  validate(ContentValidator.updatePrivacy),
  contentController.updatePrivacySection
);

// Update Terms & Conditions section
router.put(
  '/admin/terms',
  validate(ContentValidator.updateTerms),
  contentController.updateTermsSection
);

// Reorder FAQs
router.post(
  '/admin/faqs/reorder',
  validate(ContentValidator.reorderFAQs),
  contentController.reorderFAQs
);

// Delete all FAQs (admin only)
router.delete('/admin/faqs', contentController.deleteAllFAQs);

// Initialize content sections (create defaults)
router.post('/admin/initialize', contentController.initializeContent);

export default router;
