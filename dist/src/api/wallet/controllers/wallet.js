"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 *  wallet controller
 */
const strapi_1 = require("@strapi/strapi");
exports.default = strapi_1.factories.createCoreController("api::wallet.wallet", ({ strapi }) => ({
    // Method 2: Wrapping a core action (leaves core logic in place)
    async findAll(ctx) {
        const entity = await strapi.service("api::wallet.wallet").find();
        return entity;
    },
}));
