import { Request, Response } from 'express';
import { TrackingService } from './trackingService';
import { apiResponse } from '../../common/utils/apiResponse';

export class TrackingController {
  private service: TrackingService;

  constructor() {
    this.service = new TrackingService();
  }

  public getTrackingDashboard = async (req: Request, res: Response): Promise<void> => {
    const params = req.query as unknown as {
      sortCounts: string;
      sortSalesAnalytics: string;
      sortOrderStats: string;
    };

    const trackingDashboard = await this.service.getTrackingDashboard(params);
    apiResponse(res, trackingDashboard, 200, "Dashboard analytics fetched successfully");
  }
}
