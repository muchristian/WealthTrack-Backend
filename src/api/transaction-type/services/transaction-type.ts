/**
 * transaction-type service.
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreService(
  "api::transaction-type.transaction-type",
  ({ strapi }) => ({
    async find(queries: any) {
      const { user } = queries;
      console.log();
      if (+user !== 0) {
        console.log("ddddd");
        return strapi.entityService.findMany(
          "api::transaction-type.transaction-type",
          {
            populate: {
              categories: {
                populate: {
                  users_permissions_user: true,
                },
                filters: {
                  $and: [{ users_permissions_user: { id: user } }],
                },
              },
            },
          }
        );
      } else {
        console.log("eeeee");
        return strapi.entityService.findMany(
          "api::transaction-type.transaction-type",
          {}
        );
      }
    },

    async findMany(queries) {
      const { user } = queries;
      console.log(user);
      return strapi.entityService.findMany(
        "api::transaction-type.transaction-type",
        {}
      );
    },
  })
);
