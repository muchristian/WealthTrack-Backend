"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.refresh = exports.access = void 0;
const utils_1 = __importDefault(require("@strapi/utils"));
const authUtils = __importStar(require("../utils/auth"));
const errorHandler_util_1 = require("../utils/errorHandler.util");
const { ValidationError } = utils_1.default.errors;
const access = (options, { strapi }) => {
    return async (ctx, next) => {
        const accessToken = ctx.cookies.get("accessToken");
        console.log(accessToken);
        const { payload, expired } = authUtils.verifyToken(accessToken);
        console.log(payload, expired);
        if (!payload || expired) {
            return (0, errorHandler_util_1.ErrorHandler)(ctx, 401, "Unauthorized");
        }
        const isAccessTokenExist = await strapi.db
            .query("plugin::users-permissions.user")
            .findOne({
            where: {
                id: payload.id,
            },
        });
        if (!isAccessTokenExist) {
            return (0, errorHandler_util_1.ErrorHandler)(ctx, 401, "Unauthorized");
        }
        ctx.user = isAccessTokenExist;
        return next();
    };
};
exports.access = access;
const refresh = (options, { strapi }) => {
    return async (ctx, next) => {
        const refreshToken = ctx.cookies.get("refreshToken");
        const isRefreshTokenExist = await strapi.db
            .query("plugin::users-permissions.user")
            .findOne({
            where: {
                refreshToken,
            },
        });
        console.log(isRefreshTokenExist);
        if (!isRefreshTokenExist) {
            return (0, errorHandler_util_1.ErrorHandler)(ctx, 401, "Unauthorized");
        }
        ctx.user = isRefreshTokenExist;
        return next();
    };
};
exports.refresh = refresh;
