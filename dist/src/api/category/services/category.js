"use strict";
/**
 * category service.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const strapi_1 = require("@strapi/strapi");
exports.default = strapi_1.factories.createCoreService("api::category.category", ({ strapi }) => ({
    async find(queries) {
        const { transactionType } = queries;
        return strapi.entityService.findMany("api::category.category", {
            filters: {
                transaction_type: {
                    name: {
                        $eq: transactionType,
                    },
                },
            },
        });
    },
    async findMany(queries) {
        const { user } = queries;
        console.log(user);
        return strapi.entityService.findMany("api::category.category", {
            sort: { createdAt: "asc" },
            populate: {
                transaction_type: true,
            },
            filters: {
                users_permissions_user: { id: user },
            },
        });
    },
    async create(data) {
        return strapi.entityService.create("api::category.category", {
            data,
        });
    },
}));
