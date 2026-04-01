import Joi from 'joi'

const RENDER_TYPES = [
  'yn_toggle', 'yn_with_qty', 'yn_with_linft', 'yn_then_picker',
  'yn_then_picker_qty', 'qty_per_item', 'dropdown_single', 'brand_qty',
  'width_priced', 'info_only', 'freetext',
]

export const OptionGroupValidator = {
  create: Joi.object({
    label: Joi.string().required(),
    slug: Joi.string().pattern(/^[a-z0-9_]+$/).required(),
    render_type: Joi.string().valid(...RENDER_TYPES).required(),
    desc: Joi.string().allow('').optional(),
    is_active: Joi.boolean().optional(),
    sort_order: Joi.number().optional(),
  }),

  update: Joi.object({
    label: Joi.string().optional(),
    slug: Joi.string().pattern(/^[a-z0-9_]+$/).optional(),
    render_type: Joi.string().valid(...RENDER_TYPES).optional(),
    desc: Joi.string().allow('').optional(),
    is_active: Joi.boolean().optional(),
    sort_order: Joi.number().optional(),
  }),
}
