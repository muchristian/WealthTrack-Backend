"use strict";
/**
 *  category controller
 */
Object.defineProperty(exports, "__esModule", { value: true });
const strapi_1 = require("@strapi/strapi");
exports.default = strapi_1.factories.createCoreController("api::category.category", ({ strapi }) => ({
    // Method 2: Wrapping a core action (leaves core logic in place)
    async findAll(ctx) {
        const queries = ctx.request.query;
        const entity = await strapi
            .service("api::category.category")
            .find(queries);
        return entity.filter((c) => c.transaction_type !== null);
    },
}));
