import { BaseController } from '../../common/core/baseController'
import { OptionGroupService } from './optionGroupService'
import { OptionGroup } from './optionGroupInterface'
import { Request, Response } from 'express'
import { apiResponse } from '../../common/utils/apiResponse'
import { ProductTypeService } from '../productType/productTypeService'

export class OptionGroupController extends BaseController<OptionGroup, OptionGroupService> {
  private productTypeService: ProductTypeService;

  constructor(optionGroupService: OptionGroupService) {
    super(optionGroupService)
    this.productTypeService = new ProductTypeService();
  }

  public getAll = async (req: Request, res: Response): Promise<void> => {
    const filter: Record<string, unknown> = {}
    if (req.query.is_active === 'true') filter.is_active = true
    const data = await this.service.getAll({ ...filter, sort: { sort_order: 1, createdAt: -1 } })
    apiResponse(res, data, 200)
  }

  public getByProductSlug = async (req: Request, res: Response): Promise<void> => {
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

    const allGroups = await this.service.getAll(filter);

    const sorted = groupSlugs
      .map((slug) => allGroups.find((g: any) => g.slug === slug))
      .filter(Boolean) as any[];

    // Also resolve any sub_option groups not already in the list
    const existingSlugs = new Set(sorted.map((g: any) => g.slug))
    const subOptionSlugs = new Set<string>()
    sorted.forEach((g: any) => (g.sub_options ?? []).forEach((so: any) => subOptionSlugs.add(so.slug)))
    const missingSlugs = [...subOptionSlugs].filter(s => !existingSlugs.has(s))
    if (missingSlugs.length > 0) {
      const subGroups = await this.service.getAll({ slug: { $in: missingSlugs } })
      sorted.push(...subGroups)
    }

    return apiResponse(res, sorted, 200);
  }
}
