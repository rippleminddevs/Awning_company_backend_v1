import Joi from 'joi';

export const ProductPriceValidator = {
  create: Joi.object({
    product_type_slug: Joi.string().required(),
    width_ft: Joi.number().required(),
    projection_ft: Joi.number().optional().allow(null),
    projection_in: Joi.number().optional().allow(null),
    height_ft: Joi.number().optional().allow(null),
    msrp: Joi.number().required(),
  }),

  update: Joi.object({
    product_type_slug: Joi.string().optional(),
    width_ft: Joi.number().optional(),
    projection_ft: Joi.number().optional().allow(null),
    projection_in: Joi.number().optional().allow(null),
    height_ft: Joi.number().optional().allow(null),
    msrp: Joi.number().optional(),
  }),
};