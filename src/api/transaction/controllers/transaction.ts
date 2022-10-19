"use strict";

/**
 *  transaction controller
 */

import { factories } from "@strapi/strapi";
import walletService from "../../wallet/services/wallet";

const filterData = (data, type) => {
  return data.filter((d) => d.transaction_type == type);
};

export default factories.createCoreController(
  "api::transaction.transaction",
  ({ strapi }: { strapi: any }) => ({
    async findAll(ctx) {
      const entity = await strapi
        .service("api::transaction.transaction")
        .find();
      const data = {
        all: entity,
        income: filterData(entity, "Income"),
        debt_loan: filterData(entity, "Debt/Loan"),
        expense: filterData(entity, "Expense"),
      };
      console.log(data);
      return data;
    },

    async createTransaction(ctx) {
      console.log(ctx.request.body);
      const { wallet_id } = ctx.request.body.data;
      // const findWallet = walletService().findOne(wallet_id);
      const findWallet = await strapi
        .service("api::transaction.transaction")
        .findWallet(wallet_id);

      if (!findWallet) return ctx.NotFound("The wallet does not exist");
      console.log(findWallet);
      const entity = await strapi
        .service("api::transaction.transaction")
        .create({ ...ctx.request.body.data, wallet: findWallet.name });
      return entity;
    },
  })
);
