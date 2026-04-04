import Joi from 'joi'

export const ProductSubCategoryValidator = {
  create: Joi.object({
    category_slug: Joi.string().required(),
    slug:          Joi.string().required(),
    display_name:  Joi.string().required(),
    description:   Joi.string().optional().allow('', null),
    sort_order:    Joi.number().optional(),
    is_active:     Joi.boolean().optional(),
  }),

  update: Joi.object({
    category_slug: Joi.string().optional(),
    slug:          Joi.string().optional(),
    display_name:  Joi.string().optional(),
    description:   Joi.string().optional().allow('', null),
    sort_order:    Joi.number().optional(),
    is_active:     Joi.boolean().optional(),
  }),
}