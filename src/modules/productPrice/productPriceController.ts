import { BaseController } from '../../common/core/baseController'
import { ProductPriceService } from './productPriceService'
import { ProductPrice } from './productPriceInterface'
import { apiResponse } from '../../common/utils/apiResponse'
import { Request, Response } from 'express'

export class ProductPriceController extends BaseController<ProductPrice, ProductPriceService> {
  constructor(productPriceService: ProductPriceService) {
    super(productPriceService)
  }

  public getAll = async (req: Request, res: Response): Promise<void> => {
    const params = req.query;
    // if (!slug) {
    //   return apiResponse(res, {}, 400, 'slug is required');
    // }

    const filter: Record<string, unknown> = {};
    if (params.width_ft)            filter.width_ft = parseFloat(params.width_ft as string);
    if (params.height_ft)           filter.height_ft = parseFloat(params.height_ft as string);
    if (params.projection_ft)       filter.projection_ft = parseFloat(params.projection_ft as string);
    if (params.projection_in)       filter.projection_in = parseFloat(params.projection_in as string);
    if (params.height_plus_proj_ft) filter.height_plus_proj_ft = parseFloat(params.height_plus_proj_ft as string);

    const data = await this.service.getAll({ ...params, ...filter });
    apiResponse(res, data, 200);
  }
}
