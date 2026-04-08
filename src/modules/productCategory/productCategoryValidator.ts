import Joi from 'joi'

export const ProductCategoryValidator = {
  create: Joi.object({
    display_name: Joi.string().required(),
    slug: Joi.string().required(),
    sort_order: Joi.number().required(),
    is_active: Joi.boolean().required(),
    has_sub_categories: Joi.boolean().optional().allow(null),
  }),

  update: Joi.object({
    display_name: Joi.string().optional(),
    slug: Joi.string().optional(),
    sort_order: Joi.number().optional(),
    is_active: Joi.boolean().optional(),
    has_sub_categories: Joi.boolean().optional().allow(null),
  }),
}