"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sanitizeOutput = void 0;
const utils_1 = __importDefault(require("@strapi/utils"));
const { sanitize } = utils_1.default;
const sanitizeOutput = (data, ctx, schema) => {
    const { response } = ctx.state;
    return sanitize.contentAPI.output(data, schema, {
        response,
    });
};
exports.sanitizeOutput = sanitizeOutput;
