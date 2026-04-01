import { BaseService } from '../../common/core/baseService'
import { OptionItemModel } from './optionItemModel'
import { OptionItem } from './optionItemInterface'

export class OptionItemService extends BaseService<OptionItem> {
  constructor() {
    super(OptionItemModel.getInstance())
  }

  public getByGroup = async (groupId: string): Promise<OptionItem[]> => {
    return this.model.getAll({ group_id: groupId })
  }
}
