import Joi from 'joi'

const RENDER_TYPES = [
  'yn_toggle', 'yn_with_qty', 'yn_with_linft', 'yn_then_picker',
  'yn_then_picker_qty', 'qty_per_item', 'dropdown_single', 'brand_qty',
  'width_priced', 'info_only', 'freetext', 'fabric_picker',
]

const subFieldSchema = Joi.object({
  key:       Joi.string().required(),
  label:     Joi.string().required(),
  free_text: Joi.boolean().optional(),
  options:   Joi.array().items(Joi.string()).optional(),
})

const itemSchema = Joi.object({
  label:     Joi.string().required(),
  price:     Joi.number().allow(null).optional(),
  is_active: Joi.boolean().optional(),
  sort_order: Joi.number().optional(),
  brand:     Joi.string().allow('', null).optional(),
})

const subOptionRefSchema = Joi.object({
  slug:       Joi.string().pattern(/^[a-z0-9_]+$/).required(),
  sort_order: Joi.number().optional(),
  required:   Joi.boolean().optional(),
})

const pricingSchema = Joi.object({
  type:        Joi.string().valid('flat', 'per_qty', 'per_linft', 'width', 'per_choice').optional(),
  amount:      Joi.number().allow(null).optional(),
  width_table: Joi.object().pattern(Joi.string(), Joi.number()).allow(null).optional(),
})

const sharedFields = {
  display_label:     Joi.string().optional(),
  slug:              Joi.string().pattern(/^[a-z0-9_]+$/).optional(),
  render_type:       Joi.string().valid(...RENDER_TYPES).optional(),
  desc:              Joi.string().allow('').optional(),
  is_active:         Joi.boolean().optional(),
  sort_order:        Joi.number().optional(),
  yes_no_required:   Joi.boolean().optional(),
  na_allowed:        Joi.boolean().optional(),
  qty_min:           Joi.number().integer().min(0).optional(),
  qty_max:           Joi.number().integer().min(1).optional(),
  unit_price:        Joi.number().min(0).optional(),
  option_type_filter:Joi.string().allow('', null).optional(),
  option_slug_filter:Joi.string().allow('', null).optional(),
  sub_fields:        Joi.array().items(subFieldSchema).optional(),
  fabric_types:      Joi.array().items(Joi.string()).optional(),
  depends_on_slug:            Joi.string().allow('', null).optional(),
  depends_on_value:           Joi.string().allow('', null).optional(),
  depends_on_width_operator:  Joi.string().valid('>=', '<=', '<', '>', '=').allow(null).optional(),
  depends_on_width_value:     Joi.number().allow(null).optional(),
  items:             Joi.array().items(itemSchema).optional(),
  sub_options:       Joi.array().items(subOptionRefSchema).optional(),
  pricing:           pricingSchema.allow(null).optional(),
}

export const OptionGroupValidator = {
  create: Joi.object({
    ...sharedFields,
    display_label: Joi.string().required(),
    slug:          Joi.string().pattern(/^[a-z0-9_]+$/).required(),
    render_type:   Joi.string().valid(...RENDER_TYPES).required(),
  }),

  update: Joi.object(sharedFields),
}
