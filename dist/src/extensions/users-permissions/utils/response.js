"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.success = void 0;
const success = (message, data, token) => {
    return {
        message,
        data,
        token,
    };
};
exports.success = success;
