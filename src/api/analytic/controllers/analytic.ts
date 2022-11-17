/**
 *  analytic controller
 */

import { factories } from "@strapi/strapi";
import _ from "lodash";
import { response } from "../../../utils/response";

export default factories.createCoreController(
  "api::analytic.analytic",
  ({ strapi }: { strapi: any }) => ({
    // Method 2: Wrapping a core action (leaves core logic in place)
    async findAll(ctx) {
      const queries = ctx.request.query;
      console.log(queries);
      const { type, user } = queries;
      const entity = await strapi
        .service("api::analytic.analytic")
        .find({
          ctx,
          filter: _.pick(queries, ["dateFrom", "dateTo"]),
          type,
          user,
        });
      return response(ctx, 200, undefined, entity, undefined);
    },
  })
);
