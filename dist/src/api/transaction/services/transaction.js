"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * transaction service.
 */
const strapi_1 = require("@strapi/strapi");
exports.default = strapi_1.factories.createCoreService("api::transaction.transaction", ({ strapi }) => ({
    async find(filter) {
        const { dateFrom, dateTo, search, user } = filter;
        let searchQuery = {};
        console.log(search);
        if (search)
            searchQuery = {
                category: {
                    $containsi: search,
                },
            };
        console.log("dd", user);
        return strapi.entityService.findMany("api::transaction.transaction", {
            filters: {
                ...searchQuery,
                date: {
                    $between: [dateFrom, dateTo],
                },
                users_id: { id: user },
            },
        });
    },
    async create(data) {
        return strapi.entityService.create("api::transaction.transaction", {
            data,
        });
    },
    async findWallet(wallet) {
        return strapi.entityService.findMany("api::wallet.wallet", {
            filters: { name: wallet },
        });
    },
}));
