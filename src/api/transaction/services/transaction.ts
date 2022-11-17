"use strict";

/**
 * transaction service.
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreService(
  "api::transaction.transaction",
  ({ strapi }) => ({
    async find(filter: any) {
      const { dateFrom, dateTo, search, user } = filter;
      let searchQuery = {};
      console.log(search);
      if (search)
        searchQuery = {
          category: {
            $containsi: search,
          },
        };
      console.log("dd", user);
      return strapi.entityService.findMany("api::transaction.transaction", {
        filters: {
          ...searchQuery,
          date: {
            $between: [dateFrom, dateTo],
          },
          users_id: { id: user },
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
