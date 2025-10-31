import { Request, Response } from 'express'
import { InvoiceService } from './invoiceService'
import { AppError } from '../../common/utils/appError'
import { apiResponse } from '../../common/utils/apiResponse'

export class InvoiceController {
  private invoiceService: InvoiceService

  constructor() {
    this.invoiceService = new InvoiceService()
  }

  public generateInvoice = async (req: Request, res: Response): Promise<void> => {
    try {
      const { quoteId } = req.params
      const response = await this.invoiceService.generatePdfWithData(quoteId)
      apiResponse(res, response, 200, 'Invoice generated successfully')
    } catch (error: any) {
      console.error('Error generating invoice:', error)
      throw AppError.notFound(error.message)
    }
  }

  public downloadInvoice = async (req: Request, res: Response): Promise<void> => {
    try {
      const { quoteId } = req.params
      const response = await this.invoiceService.getExistingInvoice(quoteId)
      apiResponse(res, response, 200, 'Invoice downloaded successfully')
    } catch (error: any) {
      console.error('Error getting existing invoice:', error)
      throw AppError.badRequest(error.message || 'Failed to get invoice')
    }
  }
}
