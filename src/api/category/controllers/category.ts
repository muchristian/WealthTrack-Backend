/**
 *  category controller
 */

import { factories } from "@strapi/strapi";
import { ErrorHandler } from "../../../utils/errorHandler.util";
import { response } from "../../../utils/response";

export default factories.createCoreController(
  "api::category.category",
  ({ strapi }: { strapi: any }) => ({
    // Method 2: Wrapping a core action (leaves core logic in place)
    async findAll(ctx) {
      const queries = ctx.request.query;
      console.log("ddddd", queries);
      if (!("transactionType" in queries)) {
        const entity = await strapi
          .service("api::category.category")
          .findMany(ctx, queries);
        return entity;
      } else {
        const entity = await strapi
          .service("api::category.category")
          .find(queries);
        return entity.filter((c) => c.transaction_type !== null);
      }
    },

    async create(ctx) {
      const { data } = ctx.request.body;
      console.log("fdsa", data);
      if (!("transaction_type" in data))
        return ErrorHandler(
          ctx,
          400,
          "Transaction_type is missing from the request"
        );
      const category = await strapi.db.query("api::category.category").findOne({
        where: {
          $and: [
            { name: data.name.toLowerCase() },
            { users_permissions_user: { id: data.users_permissions_user } },
          ],
        },
      });
      console.log(category);
      if (category) {
        return ctx.conflict("The Budget name already exist");
      }
      const entity = await strapi
        .service("api::category.category")
        .create(data);
      return response(
        ctx,
        200,
        "Category has been created successfully",
        entity,
        undefined
      );
    },

    async update(ctx) {
      ctx.request.body.data = {
        ...ctx.request.body,
      };
      // some logic here
      const result = await super.update(ctx);
      // some more logic

      return response(
        ctx,
        200,
        "Category has been updated successfully",
        result.data,
        undefined
      );
    },

    async delete(ctx) {
      console.log(ctx.params.id);
      const findCategory = await strapi.entityService.findOne(
        "api::category.category",
        ctx.params.id,
        {
          populate: { users_permissions_user: true },
        }
      );
      if (!findCategory) {
        return ctx.notFound("The Budget name not found");
      }
      console.log(findCategory);
      const findTransactions = await strapi.entityService.findMany(
        "api::transaction.transaction",
        {
          filters: {
            category: findCategory.name,
            users_id: {
              id: findCategory.users_permissions_user.id,
            },
          },
        }
      );
      console.log(findTransactions);
      if (findTransactions.length > 0) {
        return ctx.badRequest(
          "The Budget name is associated with transactions"
        );
      }
      // some logic here
      const result = await super.delete(ctx);
      // some more logic

      return response(
        ctx,
        200,
        "Category has been deleted successfully",
        result.data,
        undefined
      );
    },
  })
);
