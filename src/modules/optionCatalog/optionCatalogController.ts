import { BaseController } from '../../common/core/baseController'
import { OptionCatalogService } from './optionCatalogService'
import { OptionCatalog } from './optionCatalogInterface'
import { Request, Response } from 'express'
import { apiResponse } from '../../common/utils/apiResponse'

export class OptionCatalogController extends BaseController<OptionCatalog, OptionCatalogService> {
  constructor(optionCatalogService: OptionCatalogService) {
    super(optionCatalogService)
  }

  public getAll = async (req: Request, res: Response): Promise<void> => {
    const { type, product_slug, is_active } = req.query;
    const filter: Record<string, unknown> = {};
    if (type)         filter.option_type = type;
    if (is_active === 'true') filter.is_active = true;
    if (product_slug) filter.$or = [
      { applies_to_products: product_slug },
      { applies_to_products: { $size: 0 } },
    ];
    const data = await this.service.getAll(filter);
    return apiResponse(res, data, 200);
  }
}
