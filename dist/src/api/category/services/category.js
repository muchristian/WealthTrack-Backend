"use strict";
/**
 * category service.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const strapi_1 = require("@strapi/strapi");
const utils_1 = __importDefault(require("@strapi/utils"));
const date_util_1 = require("../../../utils/date.util");
const { ApplicationError, ValidationError } = utils_1.default.errors;
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
    async findMany(ctx, queries) {
        const { user, dateFrom, dateTo } = queries;
        console.log("fdsafdsa", user);
        const { actualStartDate, actualEndDate } = (0, date_util_1.getActualDateRange)(ctx, (0, date_util_1.parseDate)(ctx, dateFrom), (0, date_util_1.parseDate)(ctx, dateTo));
        console.log(actualEndDate);
        console.log(actualStartDate);
        const categories = await strapi.entityService.findMany("api::category.category", {
            sort: { createdAt: "asc" },
            populate: {
                transaction_type: true,
            },
            filters: {
                users_permissions_user: { id: user },
            },
        });
        console.log(categories);
        const transactions = await strapi.entityService.findMany("api::transaction.transaction", {
            filters: {
                users_id: { id: user },
                date: {
                    $between: [actualStartDate, actualEndDate],
                },
            },
            fields: ["category", "id", "amount"],
        });
        console.log(transactions);
        let res = [];
        let obj = {};
        if (transactions.length > 0) {
            for (let t of transactions) {
                if (!(t.category in obj)) {
                    obj[t.category] = 0;
                    obj[t.category] += t.amount;
                }
                else {
                    obj[t.category] += t.amount;
                }
            }
        }
        console.log(categories);
        console.log(obj);
        for (let el of categories) {
            if (obj[el.name.toLowerCase()]) {
                const usedBudget = el.budget - obj[el.name.toLowerCase()];
                const usedBudgetPercentage = Math.round((obj[el.name.toLowerCase()] / el.budget) * 100);
                const usedBudgetColor = usedBudgetPercentage > 100
                    ? "bg-red-100 text-red-800"
                    : usedBudgetPercentage <= 100 && usedBudgetPercentage > 80
                        ? "#FFBB38"
                        : "#30BE36";
                res.push({
                    ...el,
                    usedBudget,
                    usedBudgetPercentage,
                    usedBudgetColor,
                });
            }
            else {
                res.push({
                    ...el,
                });
            }
        }
        console.log(res);
        return res;
    },
    async create(data) {
        console.log("ddd", data);
        return strapi.entityService.create("api::category.category", {
            data: {
                ...data,
                name: data.name.toLowerCase(),
            },
        });
    },
}));
