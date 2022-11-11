"use strict";

/**
 * transaction service.
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreService(
  "api::transaction.transaction",
  ({ strapi }) => ({
    async find(filter: any) {
      const { dateFrom, dateTo, search } = filter;
      let searchQuery = {};
      console.log(search);
      if (search)
        searchQuery = {
          category: {
            $containsi: search,
          },
        };
      return strapi.entityService.findMany("api::transaction.transaction", {
        filters: {
          ...searchQuery,
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
