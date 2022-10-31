/**
 * category service.
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreService(
  "api::category.category",
  ({ strapi }) => ({
    async find(queries: any) {
      const { transactionType } = queries;
      return strapi.entityService.findMany("api::category.category", {
        populate: {
          transaction_type: {
            filters: {
              name: {
                $eq: transactionType,
              },
            },
          },
        },
      });
    },
    async create(data) {
      return strapi.entityService.create("api::category.category", {
        data,
      });
    },
  })
);
