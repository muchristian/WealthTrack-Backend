"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 *  transaction controller
 */
const strapi_1 = require("@strapi/strapi");
const errorHandler_util_1 = require("../../../utils/errorHandler.util");
const response_1 = require("../../../utils/response");
const filterData = (data, type) => {
    return data.filter((d) => d.transaction_type == type);
};
exports.default = strapi_1.factories.createCoreController("api::transaction.transaction", ({ strapi }) => ({
    async findAll(ctx) {
        const queries = ctx.request.query;
        const entity = await strapi
            .service("api::transaction.transaction")
            .find(queries);
        console.log(entity);
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
        ctx.request.body.data = {
            ...ctx.request.body.data,
            category: ctx.request.body.data.category.toLowerCase(),
        };
        const findWallet = await strapi
            .service("api::transaction.transaction")
            .findWallet(wallet);
        if (!findWallet)
            return (0, errorHandler_util_1.ErrorHandler)(ctx, 400, "The wallet does not exist");
        const entity = await strapi
            .service("api::transaction.transaction")
            .create({ ...ctx.request.body.data, wallet: findWallet[0].name });
        return (0, response_1.response)(ctx, 200, "Transaction has been created successfully", entity, undefined);
    },
    async update(ctx) {
        // some logic here
        ctx.request.body.data = {
            ...ctx.request.body,
        };
        try {
            const result = await super.update(ctx);
            // some more logic
            return (0, response_1.response)(ctx, 200, "Transaction has been updated successfully", result.data, undefined);
        }
        catch (error) {
            console.log(error);
        }
    },
    async delete(ctx) {
        // some logic here
        const result = await super.delete(ctx);
        // some more logic
        return (0, response_1.response)(ctx, 200, "Transaction has been deleted successfully", result.data, undefined);
    },
}));
