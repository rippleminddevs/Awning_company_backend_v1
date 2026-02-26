import { BaseService } from '../../common/core/baseService'
import { ProductCategoryModel } from './productCategoryModel'
import { ProductCategory } from './productCategoryInterface'

export class ProductCategoryService extends BaseService<ProductCategory> {
  constructor() {
    super(ProductCategoryModel.getInstance())
  }

  public getAll = async (params: any = {}): Promise<ProductCategory[]> => {
    return this.model.getAll({...params, sort: { sort_order: 1 }});
  }
}