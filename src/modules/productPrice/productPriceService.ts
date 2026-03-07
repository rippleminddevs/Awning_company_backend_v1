import { BaseService } from '../../common/core/baseService'
import { ProductPriceModel } from './productPriceModel'
import { ProductPrice } from './productPriceInterface'

export class ProductPriceService extends BaseService<ProductPrice> {
  constructor() {
    super(ProductPriceModel.getInstance())
  }
}