import { BaseController } from '../../common/core/baseController'
import { OptionGroupService } from './optionGroupService'
import { OptionGroup } from './optionGroupInterface'
import { Request, Response } from 'express'
import { apiResponse } from '../../common/utils/apiResponse'
import { ProductTypeService } from '../productType/productTypeService'

export class OptionGroupController extends BaseController<OptionGroup, OptionGroupService> {
  private productTypeService: ProductTypeService
  private optionGroupService: OptionGroupService
  constructor(optionGroupService: OptionGroupService) {
    super(optionGroupService)
    this.productTypeService = new ProductTypeService();
    this.optionGroupService = new OptionGroupService();
  }

  public getAll = async (req: Request, res: Response): Promise<void> => {
    const { product_slug, active_only } = req.query;

    if (!product_slug) {
      const filter: Record<string, unknown> = {};
      if (active_only === 'true') filter.is_active = true;
      const groups = await this.service.getAll({...filter, sort: {sort_order: 1}});
      return apiResponse(res, groups, 200);
    }

    const product = await this.productTypeService.getOne({ slug: product_slug as string })
    if (!product) {
      return apiResponse(res, {}, 404, 'Product not found');
    }

    const groupSlugs: string[] = (product as any).option_groups ?? [];
    if (groupSlugs.length === 0) {
      return apiResponse(res, {}, 200);
    }

    const filter: Record<string, unknown> = { slug: { $in: groupSlugs } };
    if (active_only === 'true') filter.is_active = true;

    const allGroups = await this.optionGroupService.getAll(filter);

    const sorted = groupSlugs
      .map((slug) => allGroups.find((g: any) => g.slug === slug))
      .filter(Boolean);

    return apiResponse(res, sorted, 200);
  }
}
