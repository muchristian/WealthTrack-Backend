"use strict";

/**
 * transaction service.
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreService(
  "api::transaction.transaction",
  ({ strapi }) => ({
    async find(filter: any) {
      const { dateFrom, dateTo } = filter;
      return strapi.entityService.findMany("api::transaction.transaction", {
        filters: {
          date: {
            $between: [dateFrom, dateTo],
          },
        },
      });
    },
    async create(data) {
      return strapi.entityService.create("api::transaction.transaction", {
        data,
      });
    },
    async findWallet(wallet) {
      return strapi.entityService.findMany("api::wallet.wallet", {
        filters: { name: wallet },
      });
    },
  })
);
