import { BaseController } from '../../common/core/baseController'
import { ProductCategoryService } from './productCategoryService'
import { ProductCategory } from './productCategoryInterface'

export class ProductCategoryController extends BaseController<ProductCategory, ProductCategoryService> {
  constructor(productCategoryService: ProductCategoryService) {
    super(productCategoryService)
  }
}
