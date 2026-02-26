import { BaseService } from '../../common/core/baseService'
import { OptionGroupModel } from './optionGroupModel'
import { OptionGroup } from './optionGroupInterface'

export class OptionGroupService extends BaseService<OptionGroup> {
  constructor() {
    super(OptionGroupModel.getInstance())
  }
}