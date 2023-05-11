"use strict";
/**
 *  transaction-type controller
 */
Object.defineProperty(exports, "__esModule", { value: true });
const strapi_1 = require("@strapi/strapi");
exports.default = strapi_1.factories.createCoreController("api::transaction-type.transaction-type", ({ strapi }) => ({
    // Method 2: Wrapping a core action (leaves core logic in place)
    async findAll(ctx) {
        const queries = ctx.request.query;
        const entity = await strapi
            .service("api::transaction-type.transaction-type")
            .find(queries);
        return entity;
    },
}));
