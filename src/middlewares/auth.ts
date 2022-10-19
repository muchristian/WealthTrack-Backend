import utils from "@strapi/utils";
import _ from "lodash";
import * as authUtils from "../utils/auth";

const { ValidationError } = utils.errors;

export const auth = (strapi) => {
  return async (ctx, next) => {
    const accessToken = ctx.cookies.get("accessToken");
    const refreshToken = ctx.cookies.get("refreshToken");

    console.log(refreshToken);
    if (!accessToken) {
      throw new ValidationError("access token not found");
    }

    const { payload, expired } = authUtils.verifyToken(accessToken);

    const { payload: refresh } =
      expired && refreshToken
        ? authUtils.verifyToken(refreshToken)
        : { payload: null };

    console.log(payload);
    console.log("fdsafdsa");
    console.log(refresh);

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

    console.log(refresh);

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
      { ..._.pick(user, ["id", "firstname", "lastname", "email"]) },
      { expiresIn: "5s" }
    );

    ctx.cookies.set("accessToken", newAccessToken, {
      httpOnly: true,
    });

    ctx.state.user = authUtils.verifyToken(newAccessToken).payload;

    return next();
  };
};
