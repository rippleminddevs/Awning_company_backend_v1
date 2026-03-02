import { BaseService } from '../../common/core/baseService'
import { OptionCatalogModel } from './optionCatalogModel'
import { OptionCatalog } from './optionCatalogInterface'

export class OptionCatalogService extends BaseService<OptionCatalog> {
  constructor() {
    super(OptionCatalogModel.getInstance())
  }
}