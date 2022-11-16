/**
 *  transaction-type controller
 */

import { factories } from "@strapi/strapi";
import { ErrorHandler } from "../../../utils/errorHandler.util";
import { response } from "../../../utils/response";

export default factories.createCoreController(
  "api::transaction-type.transaction-type",
  ({ strapi }: { strapi: any }) => ({
    // Method 2: Wrapping a core action (leaves core logic in place)
    async findAll(ctx) {
      const queries = ctx.request.query;
      console.log(+queries.user === 0);
      const entity = await strapi
        .service("api::transaction-type.transaction-type")
        .find(queries);
      return entity;
    },
  })
);
