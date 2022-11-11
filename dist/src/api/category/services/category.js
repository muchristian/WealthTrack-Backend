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
            populate: {
                transaction_type: {
                    filters: {
                        name: {
                            $eq: transactionType,
                        },
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
            filter: {
                users_permissions_user: user,
            },
            populate: {
                transaction_type: true,
            },
        });
    },
    async create(data) {
        return strapi.entityService.create("api::category.category", {
            data,
        });
    },
}));
