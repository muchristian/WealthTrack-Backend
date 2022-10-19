"use strict";

/**
 *  wallet controller
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreController(
  "api::wallet.wallet",
  ({ strapi }: { strapi: any }) => ({
    // Method 2: Wrapping a core action (leaves core logic in place)
    async findAll(ctx) {
      const entity = await strapi.service("api::wallet.wallet").find();
      return entity;
    },
  })
);
