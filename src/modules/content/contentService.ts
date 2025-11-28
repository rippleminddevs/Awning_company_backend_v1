import { BaseService } from '../../common/core/baseService';
import { ContentModelClass } from './contentModel';
import { IContent, ContentType } from './contentInterface';
import { config } from '../../services/configService';

export class ContentService extends BaseService<IContent> {
  private contentModel: ContentModelClass;

  constructor() {
    super(ContentModelClass.getInstance());
    this.contentModel = ContentModelClass.getInstance();
  }

  // Helper method to build full HTML page
  private buildFullHTMLPage(title: string, content: string): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      line-height: 1.6;
      color: #333;
      background-color: #f5f5f5;
      padding: 20px;
    }
    .container {
      max-width: 800px;
      margin: 0 auto;
      background: white;
      padding: 40px;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }
    h1, h2, h3, h4, h5, h6 {
      margin-bottom: 20px;
      color: #222;
    }
    p {
      margin-bottom: 16px;
    }
    details {
      margin-bottom: 16px;
      border: 1px solid #e0e0e0;
      border-radius: 4px;
      padding: 0;
    }
    summary {
      padding: 16px;
      background-color: #f8f9fa;
      cursor: pointer;
      font-weight: 500;
      list-style: none;
      border-radius: 4px 4px 0 0;
    }
    summary:hover {
      background-color: #e9ecef;
    }
    details p {
      padding: 16px;
      margin: 0;
      border-top: 1px solid #e0e0e0;
    }
    details[open] summary {
      border-bottom: 1px solid #e0e0e0;
    }
  </style>
</head>
<body>
  <div class="container">
    ${content}
  </div>
</body>
</html>`;
  }

  // Public Methods (No Auth Required)

  // Get About App content (for pages and seeding)
  public async getAboutContent(): Promise<IContent | null> {
    return await this.contentModel.getByType('about');
  }

  // Get Privacy Policy content (for pages and seeding)
  public async getPrivacyContent(): Promise<IContent | null> {
    return await this.contentModel.getByType('privacy');
  }

  // Get Terms & Conditions content (for pages and seeding)
  public async getTermsContent(): Promise<IContent | null> {
    return await this.contentModel.getByType('terms');
  }

  // Get About App URL (for API)
  public async getAboutContentURL(): Promise<string> {
    return `${config.app.url}/about`;
  }

  // Get Privacy Policy URL (for API)
  public async getPrivacyContentURL(): Promise<string> {
    return `${config.app.url}/privacy`;
  }

  // Get Terms & Conditions URL (for API)
  public async getTermsContentURL(): Promise<string> {
    return `${config.app.url}/terms`;
  }

  // Get FAQs URL (for API)
  public async getFAQsURL(): Promise<string> {
    return `${config.app.url}/faqs`;
  }

  // Get all app config URLs
  public async getAppConfig(): Promise<{
    about: string;
    privacy: string;
    terms: string;
    faqs: string;
  }> {
    return {
      about: `${config.app.url}/about`,
      privacy: `${config.app.url}/privacy`,
      terms: `${config.app.url}/terms`,
      faqs: `${config.app.url}/faqs`,
    };
  }

  // Get single FAQ by ID
  public async getFAQById(id: string): Promise<IContent | null> {
    return await this.contentModel.getFAQById(id);
  }

  // Admin Methods (Auth Required)

  // Create new FAQ
  public async createFAQ(data: IContent): Promise<IContent> {
    // If order is not provided, add it to the end
    if (data.order === undefined || data.order === null) {
      const faqs = await this.contentModel.getFAQs();
      const maxOrder = faqs.reduce((max, faq) => Math.max(max, faq.order || 0), -1);
      data.order = maxOrder + 1;
    } else {
      // If order is provided, reorder existing FAQs
      await this.contentModel.reorderFAQsOnInsert(data.order);
    }

    return await this.contentModel.createFAQ(data);
  }

  // Update FAQ
  public async updateFAQ(id: string, data: IContent): Promise<IContent | null> {
    return await this.contentModel.updateFAQ(id, data);
  }

  // Delete FAQ
  public async deleteFAQ(id: string): Promise<boolean> {
    return await this.contentModel.deleteFAQ(id);
  }

  // Update About section
  public async updateAboutSection(data: IContent): Promise<IContent | null> {
    return await this.contentModel.updateContentSection('about', data);
  }

  // Update Privacy Policy section
  public async updatePrivacySection(data: IContent): Promise<IContent | null> {
    return await this.contentModel.updateContentSection('privacy', data);
  }

  // Update Terms & Conditions section
  public async updateTermsSection(data: IContent): Promise<IContent | null> {
    return await this.contentModel.updateContentSection('terms', data);
  }

  // Reorder FAQs
  public async reorderFAQs(faqIds: string[]): Promise<void> {
    await this.contentModel.reorderFAQs(faqIds);
  }

  // Delete all FAQs (admin only)
  public async deleteAllFAQs(): Promise<number> {
    return await this.contentModel.deleteAllFAQs();
  }

  // Get all FAQs for admin (with pagination if needed)
  public async getAllFAQsForAdmin(options: any = {}): Promise<{ faqs: IContent[]; total: number }> {
    const page = options.page || 1;
    const limit = options.limit || 100;
    const skip = (page - 1) * limit;

    const mongooseModel = this.contentModel.getMongooseModel();
    if (!mongooseModel) {
      return { faqs: [], total: 0 };
    }

    const faqs = await mongooseModel
      .find({ type: 'faq' })
      .sort({ order: 1, createdAt: 1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await mongooseModel.countDocuments({ type: 'faq' });

    return { faqs, total };
  }

  // Initialize content sections (seed data)
  public async initializeContent(): Promise<void> {
    const aboutExists = await this.contentModel.getByType('about');
    const privacyExists = await this.contentModel.getByType('privacy');
    const termsExists = await this.contentModel.getByType('terms');

    // If About section doesn't exist, create with default
    if (!aboutExists) {
      await this.contentModel.updateContentSection('about', {
        type: 'about',
        title: 'About Jobity',
        content: '<p>Loading...</p>',
      });
    }

    // If Privacy Policy doesn't exist, create with default
    if (!privacyExists) {
      await this.contentModel.updateContentSection('privacy', {
        type: 'privacy',
        title: 'Privacy Policy',
        content: '<p>Loading...</p>',
      });
    }

    // If Terms & Conditions doesn't exist, create with default
    if (!termsExists) {
      await this.contentModel.updateContentSection('terms', {
        type: 'terms',
        title: 'Terms & Conditions',
        content: '<p>Loading...</p>',
      });
    }
  }
}
