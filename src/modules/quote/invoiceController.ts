import { Request, Response } from 'express';
import { InvoiceService } from './invoiceService';
import { AppError } from '../../common/utils/appError';
import { UploadService } from '../upload/uploadService';
import { Readable } from 'stream';
import { apiResponse } from '../../common/utils/apiResponse';

export class InvoiceController {
  private invoiceService: InvoiceService;
  private uploadService: UploadService;

  constructor() {
    this.invoiceService = new InvoiceService();
    this.uploadService = new UploadService();
  }

  public generateInvoice = async (req: Request, res: Response): Promise<void> => {
    try {
      const { quoteId } = req.params;
      const invoiceData = await this.invoiceService.generateInvoiceData(quoteId);
      
      const template = req.query.page === '2' ? 'invoice2' : 'invoice1';
      
      res.render(`invoice/${template}`, invoiceData);
    } catch (error:any) {
      console.error('Error generating invoice:', error);
      throw AppError.notFound(error.message);
    }
  };

  public downloadInvoice = async (req: Request, res: Response): Promise<void> => {
    try {
      const { quoteId } = req.params;
  
      // get invoice data
      const invoiceData = await this.invoiceService.generateInvoiceData(quoteId);
  
      // generate combined pdf
      const response = await this.invoiceService.generatePdf(invoiceData, quoteId);

      apiResponse(res, response, 200, 'Invoice downloaded successfully');
    } catch (error: any) {
      console.error("Error generating combined PDF:", error);
      throw AppError.badRequest(error.message || "Failed to generate PDF");
    }
  };
}