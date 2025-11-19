import Joi from 'joi';

export const TrackingValidator = {
  getTrackingDashboard: Joi.object({
    sortCounts: Joi.string().valid('daily', 'weekly', 'monthly', 'yearly').default('monthly'),
    sortSalesAnalytics: Joi.string().valid('daily', 'weekly', 'monthly', 'yearly').default('monthly'),
    sortOrderStats: Joi.string().valid('daily', 'weekly', 'monthly', 'yearly').default('monthly'),
  }),
};
