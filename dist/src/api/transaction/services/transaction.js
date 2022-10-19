"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * transaction service.
 */
const strapi_1 = require("@strapi/strapi");
exports.default = strapi_1.factories.createCoreService("api::transaction.transaction", ({ strapi }) => ({
    async find() {
        return strapi.entityService.findMany("api::transaction.transaction");
    },
    async create(data) {
        return strapi.entityService.create("api::transaction.transaction", {
            data,
        });
    },
    async findWallet(wallet_id) {
        return strapi.entityService.findOne("api::wallet.wallet", wallet_id);
    },
}));
