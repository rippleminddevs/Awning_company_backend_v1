import Joi from 'joi'

export const OptionCatalogValidator = {
  create: Joi.object({
    slug:              Joi.string().pattern(/^[a-z0-9_]+$/).required(),
    option_type:       Joi.string().required(),
    display_name:      Joi.string().required(),
    unit_price:        Joi.number().min(0).required(),
    price_unit:        Joi.string().optional().default('flat'),
    is_active:         Joi.boolean().optional().default(true),
    qty_based:         Joi.boolean().optional().default(false),
    brand:             Joi.string().allow('', null).optional(),
    price_tbd:         Joi.boolean().optional(),
    price_by_width:    Joi.boolean().optional(),
    width_price_table: Joi.object().pattern(Joi.string(), Joi.number()).optional(),
  }),

  update: Joi.object({
    slug:              Joi.string().pattern(/^[a-z0-9_]+$/).optional(),
    option_type:       Joi.string().optional(),
    display_name:      Joi.string().optional(),
    unit_price:        Joi.number().min(0).optional(),
    price_unit:        Joi.string().optional(),
    is_active:         Joi.boolean().optional(),
    qty_based:         Joi.boolean().optional(),
    brand:             Joi.string().allow('', null).optional(),
    price_tbd:         Joi.boolean().optional(),
    price_by_width:    Joi.boolean().optional(),
    width_price_table: Joi.object().pattern(Joi.string(), Joi.number()).optional(),
  }),
}
