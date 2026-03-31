import { BaseService } from '../../common/core/baseService'
import { ProductSubCategoryModel } from './productSubCategoryModel'
import { ProductSubCategory } from './productSubCategoryInterface'

export class ProductSubCategoryService extends BaseService<ProductSubCategory> {
  constructor() {
    super(ProductSubCategoryModel.getInstance())
  }

  public getAll = async (params: any = {}): Promise<ProductSubCategory[]> => {
    return this.model.getAll({ ...params, sort: { sort_order: 1 } })
  }
}