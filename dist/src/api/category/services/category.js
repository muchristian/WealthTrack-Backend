"use strict";
/**
 * category service.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const strapi_1 = require("@strapi/strapi");
exports.default = strapi_1.factories.createCoreService(
  "api::category.category",
  ({ strapi }) => ({
    async find(queries) {
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
