import Joi from "joi";

export const ProductTypeValidator = {
  create: Joi.object({
    category_slug: Joi.string().required(),

    sub_category_slug: Joi.string().allow(null, ""),

    slug: Joi.string().required(),

    display_name: Joi.string().required(),

    full_description: Joi.string().required(),

    sort_order: Joi.number().required(),

    is_active: Joi.boolean().required(),

    drive_type: Joi.string().required(),

    price_lookup_mode: Joi.string().allow(null, ""),

    // ✅ JSON fields
    dimension_fields: Joi.object().optional(),

    fabric_config: Joi.object().optional(),

    option_groups: Joi.array().items(Joi.string()).optional(),

    installation: Joi.object().optional(),
    
    pricing: Joi.object().optional(),

    alumawood_config: Joi.object().optional(),

    louvered_config: Joi.object().optional(),

    fixed_awning_extras: Joi.object().optional(),

    infinity_config: Joi.object().optional(),
  }),

  update: Joi.object({
    category_slug: Joi.string().optional(),

    sub_category_slug: Joi.string().allow(null, "").optional(),

    slug: Joi.string().optional(),

    display_name: Joi.string().optional(),

    full_description: Joi.string().optional(),

    sort_order: Joi.number().optional(),

    is_active: Joi.boolean().optional(),

    drive_type: Joi.string().optional(),

    price_lookup_mode: Joi.string().allow(null, "").optional(),

    dimension_fields: Joi.object().optional(),

    fabric_config: Joi.object().optional(),

    option_groups: Joi.array().items(Joi.string()).optional(),

    installation: Joi.object().optional(),

    pricing: Joi.object().optional(),

    alumawood_config: Joi.object().optional(),

    louvered_config: Joi.object().optional(),

    fixed_awning_extras: Joi.object().optional(),

    infinity_config: Joi.object().optional(),
  }),
};