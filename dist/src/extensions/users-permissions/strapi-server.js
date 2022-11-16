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
const validations = __importStar(require("./validation/auth"));
const utils_1 = __importDefault(require("@strapi/utils"));
const auth_1 = require("./utils/auth");
const sanitize_1 = require("./utils/sanitize");
const response_1 = require("../../utils/response");
const middlewares = __importStar(require("../../middlewares/auth"));
const lodash_1 = __importDefault(require("lodash"));
const { validateLoginBody, validateRegisterBody } = validations.default;
const { ApplicationError, ValidationError } = utils_1.default.errors;
function default_1(plugin) {
    // registration
    plugin.controllers.auth["register"] = async (ctx) => {
        await validateRegisterBody(ctx.request.body);
        const { email, password } = ctx.request.body;
        const user = await strapi.db
            .query("plugin::users-permissions.user")
            .findOne({
            where: {
                email: email.toLowerCase(),
            },
        });
        if (user) {
            throw new ValidationError("Email is already taken");
        }
        const hashedPassword = (0, auth_1.hashPassword)(password);
        const result = await strapi.db
            .query("plugin::users-permissions.user")
            .create({
            data: {
                ...ctx.request.body,
                password: hashedPassword,
            },
        });
        return (0, response_1.response)(ctx, 201, "User authenticated successfully", await (0, sanitize_1.sanitizeOutput)(result, ctx, strapi.getModel("plugin::users-permissions.user")), undefined);
    };
    // authentication
    plugin.controllers.auth["callback"] = async (ctx) => {
        await validateLoginBody(ctx.request.body);
        const { email, password } = ctx.request.body;
        const user = await strapi.db
            .query("plugin::users-permissions.user")
            .findOne({
            where: {
                email: email.toLowerCase(),
            },
        });
        if (!user) {
            throw new ValidationError("Invalid email or password");
        }
        const validPassword = await strapi.plugins["users-permissions"].services["user"].validatePassword(password, user.password);
        if (!validPassword) {
            throw new ValidationError("Invalid email or password");
        }
        // if (!user.confirmed) {
        //   throw new ApplicationError("Your account email is not confirmed");
        // }
        if (user.blocked === true) {
            throw new ApplicationError("Your account has been blocked by an administrator");
        }
        const accessToken = strapi.plugins["users-permissions"].services["jwt"].issue({ id: user.id, ...lodash_1.default.pick(user, ["firstname", "lastname", "email"]) }, { expiresIn: "5s" });
        const refreshToken = strapi.plugins["users-permissions"].services["jwt"].issue({ id: user.id }, { expiresIn: "1y" });
        await strapi.db.query("plugin::users-permissions.user").update({
            where: {
                id: user.id,
            },
            data: {
                refreshToken,
            },
        });
        ctx.cookies.set("accessToken", accessToken, { httpOnly: true });
        ctx.cookies.set("refreshToken", refreshToken, { httpOnly: true });
        return (0, response_1.response)(ctx, 200, "User authenticated successfully", await (0, sanitize_1.sanitizeOutput)(user, ctx, strapi.getModel("plugin::users-permissions.user")), refreshToken);
    };
    plugin.controllers.auth["google"] = async (ctx) => {
        console.log(ctx.request.query);
        // await validateGoogleAuthBody(ctx.request.body);
        // const { email } = ctx.request.body;
        // const user = await strapi.db
        //   .query("plugin::users-permissions.user")
        //   .findOne({
        //     where: {
        //       email: email.toLowerCase(),
        //     },
        //   });
        // if (!user) {
        //   throw new ValidationError("Invalid email");
        // }
        // const accessToken = strapi.plugins["users-permissions"].services[
        //   "jwt"
        // ].issue(
        //   { id: user.id, ..._.pick(user, ["firstname", "lastname", "email"]) },
        //   { expiresIn: "5s" }
        // );
        // const refreshToken = strapi.plugins["users-permissions"].services[
        //   "jwt"
        // ].issue({ id: user.id }, { expiresIn: "1y" });
        // await strapi.db.query("plugin::users-permissions.user").update({
        //   where: {
        //     id: user.id,
        //   },
        //   data: {
        //     refreshToken,
        //   },
        // });
        // ctx.cookies.set("accessToken", accessToken, { httpOnly: true });
        // ctx.cookies.set("refreshToken", refreshToken, { httpOnly: true });
        // return response(
        //   ctx,
        //   200,
        //   "User authenticated successfully",
        //   await sanitizeOutput(
        //     user,
        //     ctx,
        //     strapi.getModel("plugin::users-permissions.user")
        //   ),
        //   refreshToken
        // );
    };
    plugin.controllers.auth["refreshToken"] = (ctx) => {
        console.log(ctx.user);
        const { refreshToken, id } = ctx.user;
        const accessToken = strapi.plugins["users-permissions"].services["jwt"].issue({ id: id, ...lodash_1.default.pick(ctx.user, ["firstname", "lastname", "email"]) }, { expiresIn: "5s" });
        ctx.cookies.set("accessToken", accessToken, { httpOnly: true });
        return (0, response_1.response)(ctx, 200, "Access token has been refreshed successfully", undefined, refreshToken);
    };
    plugin.controllers.auth["logout"] = (ctx) => {
        console.log(ctx.user);
        // const { refreshToken, id } = ctx.user;
        // const accessToken = strapi.plugins["users-permissions"].services[
        //   "jwt"
        // ].issue(
        //   { id: id, ..._.pick(ctx.user, ["firstname", "lastname", "email"]) },
        //   { expiresIn: "5s" }
        // );
        // ctx.cookies.set("accessToken", accessToken, { httpOnly: true });
        // return response(
        //   ctx,
        //   200,
        //   "Access token has been refreshed successfully",
        //   undefined,
        //   refreshToken
        // );
    };
    plugin.controllers.user["find"] = async (ctx) => {
        return "fdafdsa";
    };
    plugin.middlewares = Object.assign(plugin.middlewares, middlewares);
    // Custom routes
    plugin.routes["content-api"].routes.push({
        method: "POST",
        path: "/auth/register",
        handler: "auth.register",
        config: {
            policies: [],
            prefix: "",
        },
    }, {
        method: "POST",
        path: "/auth/login",
        handler: "auth.callback",
        config: {
            middlewares: [],
            policies: [],
            prefix: "",
        },
    }, {
        method: "POST",
        path: "/auth/google",
        handler: "auth.google",
        config: {
            middlewares: [],
            policies: [],
            prefix: "",
        },
    }, {
        method: "GET",
        path: "/auth/refresh-token",
        handler: "auth.refreshToken",
        config: {
            middlewares: ["plugin::users-permissions.refresh"],
            policies: [],
            prefix: "",
        },
    }, {
        method: "GET",
        path: "/auth/logout",
        handler: "auth.logout",
        config: {
            middlewares: ["plugin::users-permissions.access"],
            policies: [],
            prefix: "",
        },
    }, {
        method: "GET",
        path: "/users",
        handler: "user.find",
        config: {
            middlewares: ["plugin::users-permissions.access"],
            prefix: "",
        },
    });
    return plugin;
}
exports.default = default_1;
function validateGoogleAuthBody(body) {
    throw new Error("Function not implemented.");
}
