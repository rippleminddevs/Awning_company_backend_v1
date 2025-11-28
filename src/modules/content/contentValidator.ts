import Joi from 'joi';

export const ContentValidator = {
  // Create FAQ
  createFAQ: Joi.object({
    question: Joi.string().required().min(5).max(200),
    answer: Joi.string().required().min(10).max(2000),
    order: Joi.number().integer().min(0).optional(),
  }),

  // Update FAQ
  updateFAQ: Joi.object({
    question: Joi.string().min(5).max(200).optional(),
    answer: Joi.string().min(10).max(2000).optional(),
    order: Joi.number().integer().min(0).optional(),
  }),

  // FAQ ID parameter
  faqIdParam: Joi.object({
    id: Joi.string()
      .pattern(/^[0-9a-fA-F]{24}$/)
      .required()
      .messages({
        'string.pattern.base': 'Invalid FAQ ID format',
        'any.required': 'FAQ ID is required',
      }),
  }),

  // Reorder FAQs
  reorderFAQs: Joi.object({
    faqIds: Joi.array()
      .items(
        Joi.string().pattern(/^[0-9a-fA-F]{24}$/)
      )
      .min(1)
      .required()
      .messages({
        'array.min': 'At least one FAQ ID is required',
        'any.required': 'FAQ IDs are required',
      }),
  }),

  // Update About section
  updateAbout: Joi.object({
    title: Joi.string().required().min(3).max(100),
    content: Joi.string().required().min(50).max(50000),
  }),

  // Update Privacy Policy
  updatePrivacy: Joi.object({
    title: Joi.string().required().min(3).max(100),
    content: Joi.string().required().min(50).max(50000),
  }),

  // Update Terms & Conditions
  updateTerms: Joi.object({
    title: Joi.string().required().min(3).max(100),
    content: Joi.string().required().min(50).max(50000),
  }),

  // Content type parameter
  contentTypeParam: Joi.object({
    type: Joi.string().valid('about', 'privacy', 'terms').required(),
  }),

  // List FAQs query
  listFAQs: Joi.object({
    page: Joi.number().integer().min(1).optional(),
    limit: Joi.number().integer().min(1).max(100).optional(),
  }),
};
