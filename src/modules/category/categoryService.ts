import { BaseService } from '../../common/core/baseService'
import { CategoryModel } from './categoryModel'
import { Category } from './categoryInterface'

export class CategoryService extends BaseService<Category> {
  constructor() {
    super(CategoryModel.getInstance())
  }
}