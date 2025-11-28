import { Request, Response } from 'express';
import { ContentService } from './contentService';
import { apiResponse } from '../../common/utils/apiResponse';
import { AppError } from '../../common/utils/appError';

export class ContentController {
  private contentService: ContentService;

  constructor() {
    this.contentService = new ContentService();
  }

  // ============================================
  // Public Endpoints (No Auth Required)
  // ============================================

  // Get About App URL
  public getAboutContent = async (req: Request, res: Response): Promise<void> => {
    try {
      const url = await this.contentService.getAboutContentURL();
      apiResponse(res, { url }, 200);
    } catch (error: any) {
      apiResponse(res, error, error.statusCode || 500);
    }
  };

  // Get Privacy Policy URL
  public getPrivacyContent = async (req: Request, res: Response): Promise<void> => {
    try {
      const url = await this.contentService.getPrivacyContentURL();
      apiResponse(res, { url }, 200);
    } catch (error: any) {
      apiResponse(res, error, error.statusCode || 500);
    }
  };

  // Get Terms & Conditions URL
  public getTermsContent = async (req: Request, res: Response): Promise<void> => {
    try {
      const url = await this.contentService.getTermsContentURL();
      apiResponse(res, { url }, 200);
    } catch (error: any) {
      apiResponse(res, error, error.statusCode || 500);
    }
  };

  // Get FAQs URL
  public getFAQs = async (req: Request, res: Response): Promise<void> => {
    try {
      const url = await this.contentService.getFAQsURL();
      apiResponse(res, { url }, 200);
    } catch (error: any) {
      apiResponse(res, error, error.statusCode || 500);
    }
  };

  // Get all app config URLs
  public getAppConfig = async (req: Request, res: Response): Promise<void> => {
    try {
      const config = await this.contentService.getAppConfig();
      apiResponse(res, config, 200);
    } catch (error: any) {
      apiResponse(res, error, error.statusCode || 500);
    }
  };

  // ============================================
  // Admin Endpoints (Auth Required)
  // ============================================

  // Create new FAQ
  public createFAQ = async (req: Request, res: Response): Promise<void> => {
    try {
      const faq = await this.contentService.createFAQ(req.body);
      apiResponse(res, faq, 201);
    } catch (error: any) {
      apiResponse(res, error, error.statusCode || 500);
    }
  };

  // Get all FAQs for admin (with pagination)
  public getAllFAQsForAdmin = async (req: Request, res: Response): Promise<void> => {
    try {
      const { faqs, total } = await this.contentService.getAllFAQsForAdmin(req.query);
      apiResponse(
        res,
        {
          faqs,
          count: faqs.length,
          total,
          page: parseInt(req.query.page as string) || 1,
          limit: parseInt(req.query.limit as string) || 100,
        },
        200
      );
    } catch (error: any) {
      apiResponse(res, error, error.statusCode || 500);
    }
  };

  // Update FAQ
  public updateFAQ = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const faq = await this.contentService.updateFAQ(id, req.body);
      if (!faq) {
        throw AppError.notFound('FAQ not found');
      }
      apiResponse(res, faq, 200);
    } catch (error: any) {
      apiResponse(res, error, error.statusCode || 500);
    }
  };

  // Delete FAQ
  public deleteFAQ = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const deleted = await this.contentService.deleteFAQ(id);
      if (!deleted) {
        throw AppError.notFound('FAQ not found');
      }
      apiResponse(res, { message: 'FAQ deleted successfully' }, 200);
    } catch (error: any) {
      apiResponse(res, error, error.statusCode || 500);
    }
  };

  // Update About section
  public updateAboutSection = async (req: Request, res: Response): Promise<void> => {
    try {
      const about = await this.contentService.updateAboutSection(req.body);
      apiResponse(res, about, 200);
    } catch (error: any) {
      apiResponse(res, error, error.statusCode || 500);
    }
  };

  // Update Privacy Policy section
  public updatePrivacySection = async (req: Request, res: Response): Promise<void> => {
    try {
      const privacy = await this.contentService.updatePrivacySection(req.body);
      apiResponse(res, privacy, 200);
    } catch (error: any) {
      apiResponse(res, error, error.statusCode || 500);
    }
  };

  // Update Terms & Conditions section
  public updateTermsSection = async (req: Request, res: Response): Promise<void> => {
    try {
      const terms = await this.contentService.updateTermsSection(req.body);
      apiResponse(res, terms, 200);
    } catch (error: any) {
      apiResponse(res, error, error.statusCode || 500);
    }
  };

  // Reorder FAQs
  public reorderFAQs = async (req: Request, res: Response): Promise<void> => {
    try {
      const { faqIds } = req.body;
      await this.contentService.reorderFAQs(faqIds);
      apiResponse(res, { message: 'FAQs reordered successfully' }, 200);
    } catch (error: any) {
      apiResponse(res, error, error.statusCode || 500);
    }
  };

  // Delete all FAQs (admin only)
  public deleteAllFAQs = async (req: Request, res: Response): Promise<void> => {
    try {
      const count = await this.contentService.deleteAllFAQs();
      apiResponse(res, { message: `${count} FAQs deleted successfully`, deletedCount: count }, 200);
    } catch (error: any) {
      apiResponse(res, error, error.statusCode || 500);
    }
  };

  // Initialize content sections (create defaults)
  public initializeContent = async (req: Request, res: Response): Promise<void> => {
    try {
      await this.contentService.initializeContent();
      apiResponse(res, { message: 'Content sections initialized successfully' }, 200);
    } catch (error: any) {
      apiResponse(res, error, error.statusCode || 500);
    }
  };
}
