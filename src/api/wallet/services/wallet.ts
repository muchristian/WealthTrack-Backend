"use strict";

/**
 * wallet service.
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreService(
  "api::wallet.wallet",
  ({ strapi }) => ({
    async find() {
      return strapi.entityService.findMany("api::wallet.wallet", {
        populate: { transactions: true },
      });
    },
    async findOne(wallet_id) {
      return strapi.entityService.findOne("api::wallet.wallet", wallet_id);
    },
  })
);
