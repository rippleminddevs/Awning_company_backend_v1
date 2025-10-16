import { BaseController } from '../../common/core/baseController'
import { SaleService } from './saleService'
import { DashboardAnalytics, Sale, SalesOverview, SalesReportParams } from './saleInterface'
import { Request, Response } from 'express'
import { apiResponse } from '../../common/utils/apiResponse'
import { GetSalesPersonsParams } from '../user/userInterface'
import fs from 'fs';

export class SaleController extends BaseController<Sale, SaleService> {
  constructor(saleService: SaleService) {
    super(saleService)
  }

  public getSalesOverview = async (req: Request, res: Response) => {
    const salesOverview = await this.service.getSalesOverview(req.query as unknown as SalesOverview)
    apiResponse(res, salesOverview, 200, "Sales Overview Fetched Successfully")
  }

  public getSalesRepresentatives = async (req: Request, res: Response): Promise<void> => {
    req.query.duration = req.query.duration || 'monthly';
    const users = await this.service.getSalesRepresentatives(req.query as GetSalesPersonsParams);
    apiResponse(res, users, 200, "Sales representatives fetched successfully");
  }

  public getCurrentOrders = async (req: Request, res: Response): Promise<void> => {
    const orders = await this.service.getCurrentOrders(req.query);
    apiResponse(res, orders, 200, "Current orders fetched successfully");
  };

  public getSalesReport = async (req: Request, res: Response): Promise<void> => {
    const params = req.query as unknown as SalesReportParams;
    const {salePersonId} = req.params;
    const salesReport = await this.service.getSalesReport(params, salePersonId);
    apiResponse(res, salesReport, 200, "Sales report fetched successfully");
  };
  
  public getDashboardAnalytics = async (req: Request, res: Response): Promise<void> => {
    const params = req.query as unknown as DashboardAnalytics;
    const dashboardAnalytics = await this.service.getDashboardAnalytics(params);
    apiResponse(res, dashboardAnalytics, 200, "Dashboard analytics fetched successfully");
  };

  public downloadSalesReport = async (req: Request, res: Response) => {

      const { salePersonId } = req.params;
      const params = req.query;
  
      if (!salePersonId) {
        throw new Error('Sale person ID is required');
      }
  
      const buffer = await this.service.downloadSalesReport(salePersonId, params);
  
      // Set headers for Excel file download
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=sales-report.xlsx`);
      
      // Send the Excel file
      return res.send(buffer);
  };
  
}
