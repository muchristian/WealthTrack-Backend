"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.response = void 0;
const response = (ctx, statusCode, message, data, token) => {
    return ctx.send({
        message,
        data,
        token,
    }, statusCode);
};
exports.response = response;
