import { BaseService } from '../../common/core/baseService'
import { ProductSubCategoryModel } from './productSubCategoryModel'
import { ProductSubCategory } from './productSubCategoryInterface'

export class ProductSubCategoryService extends BaseService<ProductSubCategory> {
  constructor() {
    super(ProductSubCategoryModel.getInstance())
  }
}