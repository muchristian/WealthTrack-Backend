"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 *  transaction controller
 */
const strapi_1 = require("@strapi/strapi");
const filterData = (data, type) => {
    return data.filter((d) => d.transaction_type == type);
};
exports.default = strapi_1.factories.createCoreController("api::transaction.transaction", ({ strapi }) => ({
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
        if (!findWallet)
            return ctx.NotFound("The wallet does not exist");
        console.log(findWallet);
        const entity = await strapi
            .service("api::transaction.transaction")
            .create({ ...ctx.request.body.data, wallet: findWallet.name });
        return entity;
    },
}));
