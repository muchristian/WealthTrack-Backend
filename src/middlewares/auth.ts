import utils from "@strapi/utils";
import _ from "lodash";
import * as authUtils from "../utils/auth";
import { ErrorHandler } from "../utils/errorHandler.util";

const { ValidationError } = utils.errors;

export const access = (options, { strapi }) => {
  return async (ctx, next) => {
    const accessToken = ctx.cookies.get("accessToken");
    console.log("------");
    console.log(accessToken);
    console.log("-----");
    const { payload, expired } = authUtils.verifyToken(accessToken);
    console.log(payload);
    console.log(expired);
    if (!payload || expired) {
      return ErrorHandler(ctx, 401, "Unauthorized");
    }
    const isAccessTokenExist = await strapi.db
      .query("plugin::users-permissions.user")
      .findOne({
        where: {
          id: payload.id,
        },
      });

    if (!isAccessTokenExist) {
      return ErrorHandler(ctx, 401, "Unauthorized");
    }
    ctx.user = isAccessTokenExist;
    return next();
  };
};

export const refresh = (options, { strapi }) => {
  return async (ctx, next) => {
    const refreshToken = ctx.cookies.get("refreshToken");
    console.log(refreshToken);
    const isRefreshTokenExist = await strapi.db
      .query("plugin::users-permissions.user")
      .findOne({
        where: {
          refreshToken,
        },
      });
    if (!isRefreshTokenExist) {
      return ErrorHandler(ctx, 401, "Unauthorized");
    }
    ctx.user = isRefreshTokenExist;
    return next();
  };
};
