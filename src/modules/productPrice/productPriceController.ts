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

    // const filter: Record<string, unknown> = { product_type_slug: slug };
    // if (width_ft)            filter.width_ft = parseFloat(width_ft as string);
    // if (height_ft)           filter.height_ft = parseFloat(height_ft as string);
    // if (projection_ft)       filter.projection_ft = parseFloat(projection_ft as string);
    // if (height_plus_proj_ft) filter.height_plus_proj_ft = parseFloat(height_plus_proj as string);

    const data = await this.service.getAll(params);
    apiResponse(res, data, 200);
  }
}
