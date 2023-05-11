"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * transaction service.
 */
const strapi_1 = require("@strapi/strapi");
const date_util_1 = require("../../../utils/date.util");
exports.default = strapi_1.factories.createCoreService("api::transaction.transaction", ({ strapi }) => ({
    async find(functions) {
        const { ctx, filter } = functions;
        const { dateFrom, dateTo, search, user, start } = filter;
        let searchQuery = {};
        if (search)
            searchQuery = {
                category: {
                    $containsi: search,
                },
            };
        const { actualStartDate, actualEndDate } = (0, date_util_1.getActualDateRange)(ctx, (0, date_util_1.parseDate)(ctx, dateFrom), (0, date_util_1.parseDate)(ctx, dateTo));
        return await strapi.entityService.findMany("api::transaction.transaction", {
            filters: {
                ...searchQuery,
                date: {
                    $between: [actualStartDate, actualEndDate],
                },
                users_id: { id: user },
            },
            sort: { date: "desc" },
            start,
            limit: 10,
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
