import { BaseController } from '../../common/core/baseController'
import { OptionGroupService } from './optionGroupService'
import { OptionGroup } from './optionGroupInterface'

export class OptionGroupController extends BaseController<OptionGroup, OptionGroupService> {
  constructor(optionGroupService: OptionGroupService) {
    super(optionGroupService)
  }
}
