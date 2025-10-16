import { BaseController } from '../../common/core/baseController'
import { QuoteService } from './quoteService'
import { Quote } from './quoteInterface'
import { Request, Response } from 'express'
import { apiResponse } from '../../common/utils/apiResponse'

export class QuoteController extends BaseController<Quote, QuoteService> {
  constructor(quoteService: QuoteService) {
    super(quoteService)
  }

  public create = async (req: Request, res: Response): Promise<void> => {
    const { file } = req;
    const payload = {
      ...req.body,
      createdBy: req.user!.id,
      paymentDetails: {
        ...req.body.paymentDetails,
        ...(file && { checkImage: file })
      }
    };

    const quote = await this.service.createQuote(payload);
    apiResponse(res, quote, 201, "Quote created successfully")
  }

  public update = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params
    const payload = req.body
    const quote = await this.service.updateQuote(id, payload)
    apiResponse(res, quote, 200, "Quote updated successfully")
  }

  public updateDocuments = async (req: Request, res: Response): Promise<void> => {

    const { id } = req.params;
    const { files } = req;
    
    let removeDocuments: string[] = [];
    if (req.body.removeDocuments) {
      removeDocuments = Array.isArray(req.body.removeDocuments)
        ? req.body.removeDocuments
        : [req.body.removeDocuments];
    }

    const payload = {
      addDocuments: files as Express.Multer.File[],
      removeDocuments: removeDocuments
    };

    const updatedQuote = await this.service.updateQuoteDocuments(id, payload as any);
    apiResponse(res, updatedQuote, 200, "Documents updated successfully");
  }

  public getAll = async (req: Request, res: Response): Promise<void> => {
    const params = req.query;
    const quotes = await this.service.getQuotes(params, req.user!.id);
    apiResponse(res, quotes, 200, "Quotes fetched successfully");
  }

  public getSalesPersonAnalytics = async (req: Request, res: Response): Promise<void> => {
    const params = req.query;
    const analytics = await this.service.getSalesPersonAnalytics(params, req.user!.id);
    apiResponse(res, analytics, 200, "Analytics fetched successfully");
  }
}
