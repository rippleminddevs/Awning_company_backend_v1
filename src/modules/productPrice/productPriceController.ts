import { BaseController } from '../../common/core/baseController'
import { ProductPriceService } from './productPriceService'
import { ProductPrice } from './productPriceInterface'

export class ProductPriceController extends BaseController<ProductPrice, ProductPriceService> {
  constructor(productPriceService: ProductPriceService) {
    super(productPriceService)
  }
}
