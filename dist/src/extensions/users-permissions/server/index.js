"use strict";
var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (
          !desc ||
          ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)
        ) {
          desc = {
            enumerable: true,
            get: function () {
              return m[k];
            },
          };
        }
        Object.defineProperty(o, k2, desc);
      }
    : function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
var __setModuleDefault =
  (this && this.__setModuleDefault) ||
  (Object.create
    ? function (o, v) {
        Object.defineProperty(o, "default", { enumerable: true, value: v });
      }
    : function (o, v) {
        o["default"] = v;
      });
var __importStar =
  (this && this.__importStar) ||
  function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null)
      for (var k in mod)
        if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k))
          __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
  };
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.auth = void 0;
const utils_1 = __importDefault(require("@strapi/utils"));
const lodash_1 = __importDefault(require("lodash"));
const authUtils = __importStar(require("../../../utils/auth"));
const { ValidationError } = utils_1.default.errors;
const auth = (strapi) => {
  return async (ctx, next) => {
    const accessToken = ctx.cookies.get("accessToken");
    const refreshToken = ctx.cookies.get("refreshToken");
    if (!accessToken) {
      throw new ValidationError("access token not found");
    }
    const { payload, expired } = authUtils.verifyToken(accessToken);
    const { payload: refresh } =
      expired && refreshToken
        ? authUtils.verifyToken(refreshToken)
        : { payload: null };
    if (payload) {
      const user = await strapi.db
        .query("plugin::users-permissions.user")
        .findOne({
          where: {
            id: payload.id,
          },
        });
      if (!user) {
        throw new ValidationError("Invalid user");
      }
      ctx.state.user = user;
      return next();
    }
    if (!refresh) {
      throw new ValidationError("refresh token not found");
    }
    const user = await strapi.db
      .query("plugin::users-permissions.user")
      .findOne({
        where: {
          id: refresh.id,
        },
      });
    if (!user) {
      throw new ValidationError("Invalid user");
    }
    const newAccessToken = strapi.plugins["users-permissions"].services[
      "jwt"
    ].issue(
      {
        ...lodash_1.default.pick(user, [
          "id",
          "firstname",
          "lastname",
          "email",
        ]),
      },
      { expiresIn: "5s" }
    );
    ctx.cookies.set("accessToken", newAccessToken, {
      httpOnly: true,
    });
    ctx.state.user = authUtils.verifyToken(newAccessToken).payload;
    return next();
  };
};
exports.auth = auth;
