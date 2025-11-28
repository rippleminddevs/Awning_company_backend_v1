import { Router, Request, Response } from 'express';
import { ContentService } from './contentService';

const router = Router();
const contentService = new ContentService();

// Helper method to build full HTML page (same as in ContentService)
const buildFullHTMLPage = (title: string, content: string): string => {
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
};

// FAQ page
router.get('/faqs', async (req: Request, res: Response) => {
  try {
    // Get raw FAQ data from model
    const faqs = await contentService.getAllFAQsForAdmin({ page: 1, limit: 1000 });

    if (faqs.total === 0) {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res
        .status(200)
        .send(buildFullHTMLPage('Frequently Asked Questions', '<p>No FAQs available</p>'));
      return;
    }

    // Format FAQs as collapsible HTML
    const faqHTML = faqs.faqs
      .map((faq: any) => {
        return `<details>
  <summary>${faq.question}</summary>
  <p>${faq.answer}</p>
</details>`;
      })
      .join('\n\n');

    const count = faqs.total;
    const html = buildFullHTMLPage(
      'Frequently Asked Questions',
      `<h1>Frequently Asked Questions</h1>\n<p>${count} questions</p>\n\n${faqHTML}`
    );

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.status(200).send(html);
  } catch (error: any) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res
      .status(500)
      .send(buildFullHTMLPage('Error', `<p>${error.message || 'Something went wrong'}</p>`));
  }
});

// About page
router.get('/about', async (req: Request, res: Response) => {
  try {
    const content = await contentService.getAboutContent();

    if (!content || !content.content) {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.status(200).send(buildFullHTMLPage('About Jobity', '<p>Content not found</p>'));
      return;
    }

    const html = buildFullHTMLPage(content.title || 'About Jobity', content.content);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.status(200).send(html);
  } catch (error: any) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res
      .status(500)
      .send(buildFullHTMLPage('Error', `<p>${error.message || 'Something went wrong'}</p>`));
  }
});

// Privacy Policy page
router.get('/privacy', async (req: Request, res: Response) => {
  try {
    const content = await contentService.getPrivacyContent();

    if (!content || !content.content) {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.status(200).send(buildFullHTMLPage('Privacy Policy', '<p>Content not found</p>'));
      return;
    }

    const html = buildFullHTMLPage(content.title || 'Privacy Policy', content.content);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.status(200).send(html);
  } catch (error: any) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res
      .status(500)
      .send(buildFullHTMLPage('Error', `<p>${error.message || 'Something went wrong'}</p>`));
  }
});

// Terms & Conditions page
router.get('/terms', async (req: Request, res: Response) => {
  try {
    const content = await contentService.getTermsContent();

    if (!content || !content.content) {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.status(200).send(buildFullHTMLPage('Terms & Conditions', '<p>Content not found</p>'));
      return;
    }

    const html = buildFullHTMLPage(content.title || 'Terms & Conditions', content.content);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.status(200).send(html);
  } catch (error: any) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res
      .status(500)
      .send(buildFullHTMLPage('Error', `<p>${error.message || 'Something went wrong'}</p>`));
  }
});

export default router;
