import { BaseService } from '../../common/core/baseService'
import { ProductTypeModel } from './productTypeModel'
import { ProductType } from './productTypeInterface'

export class ProductTypeService extends BaseService<ProductType> {
  constructor() {
    super(ProductTypeModel.getInstance())
  }
}