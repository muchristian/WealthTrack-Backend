"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * wallet service.
 */
const strapi_1 = require("@strapi/strapi");
exports.default = strapi_1.factories.createCoreService("api::wallet.wallet", ({ strapi }) => ({
    async find() {
        return strapi.entityService.findMany("api::wallet.wallet", {
            populate: { transactions: true },
        });
    },
    async findOne(wallet_id) {
        return strapi.entityService.findOne("api::wallet.wallet", wallet_id);
    },
}));
