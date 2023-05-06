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
const sendgrid_1 = require("../../utils/sendgrid");
const forgotPasswordEmailTemplate_1 = require("./utils/forgotPasswordEmailTemplate");
const { validateLoginBody, validateRegisterBody, validateForgotPasswordBody, validateResetPasswordBody, } = validations.default;
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
        const hashedPassword = await (0, auth_1.hashPassword)(password);
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
        const provider = ctx.params.provider || "local";
        console.log(ctx.params);
        if (provider === "local") {
            await validateLoginBody(ctx.request.body);
            const { email, password } = ctx.request.body;
            const user = await strapi.db
                .query("plugin::users-permissions.user")
                .findOne({
                where: {
                    email: email.toLowerCase(),
                },
            });
            console.log(user.password);
            if (!user) {
                throw new ValidationError("Invalid email or password");
            }
            console.log(password);
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
            const accessToken = strapi.plugins["users-permissions"].services["jwt"].issue({ id: user.id, ...lodash_1.default.pick(user, ["firstname", "lastname", "email"]) }, { expiresIn: "5m" });
            const refreshToken = strapi.plugins["users-permissions"].services["jwt"].issue({ id: user.id, ...lodash_1.default.pick(user, ["firstname", "lastname", "email"]) }, { expiresIn: "1y" });
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
        }
        const { query } = ctx;
        console.log(query);
        const access_token = query.access_token || query.code || query.oauth_token;
        if (!access_token) {
            throw new ValidationError("No access_token.");
        }
        const providers = await strapi
            .store({ type: "plugin", name: "users-permissions", key: "grant" })
            .get();
        // Get the profile.
        const profile = await strapi.plugins["users-permissions"].services["providers-registry"].run({ provider, query, access_token, providers });
        console.log(profile);
        const email = profile.email.toLowerCase();
        // We need at least the mail.
        if (!email) {
            throw new ValidationError("Email is not available");
        }
        const user = await strapi.db
            .query("plugin::users-permissions.user")
            .findOne({
            where: {
                email,
            },
        });
        console.log(user);
        if (!user) {
            throw new ValidationError("Invalid email or password from provider");
        }
        if (user.blocked === true) {
            throw new ApplicationError("Your account has been blocked by an administrator");
        }
        const accessToken = strapi.plugins["users-permissions"].services["jwt"].issue({ id: user.id, ...lodash_1.default.pick(user, ["firstname", "lastname", "email"]) }, { expiresIn: "5m" });
        const refreshToken = strapi.plugins["users-permissions"].services["jwt"].issue({ id: user.id, ...lodash_1.default.pick(user, ["firstname", "lastname", "email"]) }, { expiresIn: "1y" });
        console.log(user);
        console.log(refreshToken);
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
    // plugin.controllers.auth["connect"] = async (ctx, next) => {
    //   const providers = await strapi
    //     .store({ type: "plugin", name: "users-permissions", key: "grant" })
    //     .get();
    //   const apiPrefix = strapi.config.get("api.rest.prefix");
    //   const grantConfig = {
    //     defaults: {
    //       prefix: `${apiPrefix}/connect`,
    //     },
    //     ...providers,
    //   };
    //   const [requestPath] = ctx.request.url.split("?");
    //   const provider = requestPath.split("/connect/")[1].split("/")[0];
    //   if (!_.get(grantConfig[provider], "enabled")) {
    //     throw new ApplicationError("This provider is disabled");
    //   }
    //   if (!strapi.config.server.url.startsWith("http")) {
    //     strapi.log.warn(
    //       "You are using a third party provider for login. Make sure to set an absolute url in config/server.js. More info here: https://docs.strapi.io/developer-docs/latest/plugins/users-permissions.html#setting-up-the-server-url"
    //     );
    //   }
    //   // Ability to pass OAuth callback dynamically
    //   grantConfig[provider].callback =
    //     _.get(ctx, "query.callback") ||
    //     _.get(ctx, "session.grant.dynamic.callback") ||
    //     grantConfig[provider].callback;
    //   grantConfig[
    //     provider
    //   ].redirect_uri = `${strapi.config.server.url}/connect/${provider}/callback`;
    //   return grant(grantConfig)(ctx, next);
    //   // await validateGoogleAuthBody(ctx.request.body);
    //   // const { email } = ctx.request.body;
    //   // const user = await strapi.db
    //   //   .query("plugin::users-permissions.user")
    //   //   .findOne({
    //   //     where: {
    //   //       email: email.toLowerCase(),
    //   //     },
    //   //   });
    //   // if (!user) {
    //   //   throw new ValidationError("Invalid email");
    //   // }
    //   // const accessToken = strapi.plugins["users-permissions"].services[
    //   //   "jwt"
    //   // ].issue(
    //   //   { id: user.id, ..._.pick(user, ["firstname", "lastname", "email"]) },
    //   //   { expiresIn: "5s" }
    //   // );
    //   // const refreshToken = strapi.plugins["users-permissions"].services[
    //   //   "jwt"
    //   // ].issue({ id: user.id }, { expiresIn: "1y" });
    //   // await strapi.db.query("plugin::users-permissions.user").update({
    //   //   where: {
    //   //     id: user.id,
    //   //   },
    //   //   data: {
    //   //     refreshToken,
    //   //   },
    //   // });
    //   // ctx.cookies.set("accessToken", accessToken, { httpOnly: true });
    //   // ctx.cookies.set("refreshToken", refreshToken, { httpOnly: true });
    //   // return response(
    //   //   ctx,
    //   //   200,
    //   //   "User authenticated successfully",
    //   //   await sanitizeOutput(
    //   //     user,
    //   //     ctx,
    //   //     strapi.getModel("plugin::users-permissions.user")
    //   //   ),
    //   //   refreshToken
    //   // );
    // };
    plugin.controllers.auth["google"] = async (ctx) => {
        console.log(ctx);
        console.log(ctx.request.query);
    };
    plugin.controllers.auth["refreshToken"] = (ctx) => {
        console.log(ctx.user);
        const { refreshToken, id } = ctx.user;
        const accessToken = strapi.plugins["users-permissions"].services["jwt"].issue({ id: id, ...lodash_1.default.pick(ctx.user, ["firstname", "lastname", "email"]) }, { expiresIn: "5m" });
        console.log(accessToken);
        ctx.cookies.set("accessToken", accessToken, { httpOnly: true });
        return (0, response_1.response)(ctx, 200, "Access token has been refreshed successfully", undefined, refreshToken);
    };
    plugin.controllers.auth["logout"] = async (ctx) => {
        console.log(ctx.user);
        const { id } = ctx.user;
        await strapi.db.query("plugin::users-permissions.user").update({
            where: {
                id,
            },
            data: {
                refreshToken: "",
            },
        });
        ctx.cookies.set("accessToken");
        ctx.cookies.set("refreshToken");
        return (0, response_1.response)(ctx, 200, "You successfully logged out", undefined, undefined);
    };
    plugin.controllers.auth["forgotPassword"] = async (ctx) => {
        await validateForgotPasswordBody(ctx.request.body);
        const { email } = ctx.request.body;
        const user = await strapi.db
            .query("plugin::users-permissions.user")
            .findOne({
            where: {
                email: email.toLowerCase(),
            },
        });
        if (!user) {
            throw new ValidationError("Invalid email");
        }
        console.log(email);
        const resetToken = strapi.plugins["users-permissions"].services["jwt"].issue({ id: user.id }, { expiresIn: "10m" });
        const msg = {
            to: email,
            from: "muchris.dev@gmail.com",
            subject: "Forgot password",
            text: "A confirmation email to reset your password",
            html: (0, forgotPasswordEmailTemplate_1.forgotPasswordEmailTemplate)(user, resetToken),
        };
        (0, sendgrid_1.sendEmail)(msg);
        return (0, response_1.response)(ctx, 200, "You successfully received reset password confirmation email", undefined, undefined);
    };
    plugin.controllers.auth["resetPassword"] = async (ctx) => {
        await validateResetPasswordBody(ctx.request.body);
        const { id } = ctx.request.params;
        const { password } = ctx.request.body;
        const userExist = await strapi.db
            .query("plugin::users-permissions.user")
            .findOne({
            where: {
                id,
            },
        });
        if (!userExist) {
            throw new ValidationError("Invalid user");
        }
        const validPassword = await strapi.plugins["users-permissions"].services["user"].validatePassword(password, userExist.password);
        if (validPassword) {
            throw new ValidationError("The password is the same as the previous");
        }
        const hashedPassword = await (0, auth_1.hashPassword)(password);
        const updatedUser = await strapi.db
            .query("plugin::users-permissions.user")
            .update({
            where: {
                id,
            },
            data: {
                password: hashedPassword,
            },
        });
        console.log(password);
        console.log(updatedUser);
        return (0, response_1.response)(ctx, 200, "You successfully reseted password", undefined, undefined);
    };
    plugin.controllers.user["find"] = async (ctx) => {
        const { id } = ctx.request.params;
        console.log(id, "fdsa");
        const user = await strapi.db
            .query("plugin::users-permissions.user")
            .findOne({
            where: { id },
        });
        if (!user) {
            throw new ValidationError("Invalid user");
        }
        console.log(user);
        return (0, response_1.response)(ctx, 200, "User retrieved successfully", await (0, sanitize_1.sanitizeOutput)(user, ctx, strapi.getModel("plugin::users-permissions.user")), undefined);
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
        method: "GET",
        path: "/api/connect/google/callback",
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
        method: "POST",
        path: "/auth/forgot-password",
        handler: "auth.forgotPassword",
        config: {
            middlewares: [],
            prefix: "",
        },
    }, {
        method: "PUT",
        path: "/auth/reset-password/:id",
        handler: "auth.resetPassword",
        config: {
            middlewares: [],
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
        path: "/user/:id",
        handler: "user.find",
        config: {
            middlewares: ["plugin::users-permissions.access"],
            policies: [],
            prefix: "",
        },
    });
    return plugin;
}
exports.default = default_1;
