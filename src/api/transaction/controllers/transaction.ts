"use strict";

/**
 *  transaction controller
 */

import { factories } from "@strapi/strapi";
import { ErrorHandler } from "../../../utils/errorHandler.util";
import { response } from "../../../utils/response";
import walletService from "../../wallet/services/wallet";

const filterData = (data, type) => {
  return data.filter((d) => d.transaction_type == type);
};

export default factories.createCoreController(
  "api::transaction.transaction",
  ({ strapi }: { strapi: any }) => ({
    async findAll(ctx) {
      const queries = ctx.request.query;
      const entity = await strapi
        .service("api::transaction.transaction")
        .find(queries);
      const data = {
        all: entity,
        income: filterData(entity, "Income"),
        debt_loan: filterData(entity, "Debt/Loan"),
        expense: filterData(entity, "Expense"),
      };
      return data;
    },

    async createTransaction(ctx) {
      const { wallet } = ctx.request.body.data;
      const findWallet = await strapi
        .service("api::transaction.transaction")
        .findWallet(wallet);
      if (!findWallet)
        return ErrorHandler(ctx, 400, "The wallet does not exist");
      const entity = await strapi
        .service("api::transaction.transaction")
        .create({ ...ctx.request.body.data, wallet: findWallet[0].name });

      return response(
        ctx,
        200,
        "Transaction has been created successfully",
        entity,
        undefined
      );
    },

    async update(ctx) {
      // some logic here
      ctx.request.body.data = {
        ...ctx.request.body,
      };
      try {
        const result = await super.update(ctx);
        // some more logic

        return response(
          ctx,
          200,
          "Transaction has been updated successfully",
          result.data,
          undefined
        );
      } catch (error) {
        console.log(error);
      }
    },

    async delete(ctx) {
      // some logic here
      const result = await super.delete(ctx);
      // some more logic

      return response(
        ctx,
        200,
        "Transaction has been deleted successfully",
        result.data,
        undefined
      );
    },
  })
);
