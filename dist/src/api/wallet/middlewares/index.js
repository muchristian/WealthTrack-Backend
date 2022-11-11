"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.auth = void 0;
const auth = (config, { strapi }) => {
    return async (ctx, next) => {
        await next();
    };
};
exports.auth = auth;
