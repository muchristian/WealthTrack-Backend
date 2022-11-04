"use strict";

/**
 * transaction service.
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreService(
  "api::transaction.transaction",
  ({ strapi }) => ({
    async find() {
      return strapi.entityService.findMany("api::transaction.transaction");
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
