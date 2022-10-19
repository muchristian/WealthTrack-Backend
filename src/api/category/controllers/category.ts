/**
 *  category controller
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreController(
  "api::category.category",
  ({ strapi }: { strapi: any }) => ({
    // Method 2: Wrapping a core action (leaves core logic in place)
    async findAll(ctx) {
      const queries = ctx.request.query;
      const entity = await strapi
        .service("api::category.category")
        .find(queries);
      return entity.filter((c) => c.transaction_type !== null);
    },
  })
);
