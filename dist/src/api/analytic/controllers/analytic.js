"use strict";
/**
 *  analytic controller
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const strapi_1 = require("@strapi/strapi");
const lodash_1 = __importDefault(require("lodash"));
const response_1 = require("../../../utils/response");
exports.default = strapi_1.factories.createCoreController("api::analytic.analytic", ({ strapi }) => ({
    // Method 2: Wrapping a core action (leaves core logic in place)
    async findAll(ctx) {
        const queries = ctx.request.query;
        const { type } = queries;
        const entity = await strapi
            .service("api::analytic.analytic")
            .find({ ctx, filter: lodash_1.default.pick(queries, ["dateFrom", "dateTo"]), type });
        return (0, response_1.response)(ctx, 200, undefined, entity, undefined);
    },
}));
