"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorHandler = void 0;
const ErrorHandler = (ctx, statusCode, message) => {
    return ctx.throw(statusCode, message);
};
exports.ErrorHandler = ErrorHandler;
