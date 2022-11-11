"use strict";
/**
 *  category controller
 */
Object.defineProperty(exports, "__esModule", { value: true });
const strapi_1 = require("@strapi/strapi");
const errorHandler_util_1 = require("../../../utils/errorHandler.util");
const response_1 = require("../../../utils/response");
exports.default = strapi_1.factories.createCoreController("api::category.category", ({ strapi }) => ({
    // Method 2: Wrapping a core action (leaves core logic in place)
    async findAll(ctx) {
        const queries = ctx.request.query;
        console.log(queries);
        if (!("transactionType" in queries)) {
            const entity = await strapi
                .service("api::category.category")
                .findMany(queries);
            return entity;
        }
        else {
            const entity = await strapi
                .service("api::category.category")
                .find(queries);
            return entity.filter((c) => c.transaction_type !== null);
        }
    },
    async create(ctx) {
        if (!("transaction_type" in ctx.request.body.data))
            return (0, errorHandler_util_1.ErrorHandler)(ctx, 400, "Transaction_type is missing from the request");
        const entity = await strapi
            .service("api::category.category")
            .create(ctx.request.body.data);
        return (0, response_1.response)(ctx, 200, "Category has been created successfully", entity, undefined);
    },
    async update(ctx) {
        ctx.request.body.data = {
            ...ctx.request.body,
        };
        // some logic here
        const result = await super.update(ctx);
        // some more logic
        return (0, response_1.response)(ctx, 200, "Category has been updated successfully", result.data, undefined);
    },
    async delete(ctx) {
        // some logic here
        const result = await super.delete(ctx);
        // some more logic
        return (0, response_1.response)(ctx, 200, "Category has been deleted successfully", result.data, undefined);
    },
}));
