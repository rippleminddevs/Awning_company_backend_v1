import { BaseController } from '../../common/core/baseController'
import { ProductSubCategoryService } from './productSubCategoryService'
import { ProductSubCategory } from './productSubCategoryInterface'

export class ProductSubCategoryController extends BaseController<ProductSubCategory, ProductSubCategoryService> {
  constructor(productSubCategoryService: ProductSubCategoryService) {
    super(productSubCategoryService)
  }
}
