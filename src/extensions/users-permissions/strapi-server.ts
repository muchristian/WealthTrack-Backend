import * as validations from "./validation/auth";
import utils from "@strapi/utils";
import { hashPassword } from "./utils/auth";
import { sanitizeOutput } from "./utils/sanitize";
import { response } from "../../utils/response";
import * as middlewares from "../../middlewares/auth";
import _ from "lodash";

const { validateLoginBody, validateRegisterBody } = validations.default;
const { ApplicationError, ValidationError } = utils.errors;

export default function (plugin) {
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

    const hashedPassword = hashPassword(password);

    const result = await strapi.db
      .query("plugin::users-permissions.user")
      .create({
        data: {
          ...ctx.request.body,
          password: hashedPassword,
        },
      });

    return response(
      ctx,
      201,
      "User authenticated successfully",
      await sanitizeOutput(
        result,
        ctx,
        strapi.getModel("plugin::users-permissions.user")
      ),
      undefined
    );
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
    const validPassword = await strapi.plugins["users-permissions"].services[
      "user"
    ].validatePassword(password, user.password);
    if (!validPassword) {
      throw new ValidationError("Invalid email or password");
    }
    // if (!user.confirmed) {
    //   throw new ApplicationError("Your account email is not confirmed");
    // }
    if (user.blocked === true) {
      throw new ApplicationError(
        "Your account has been blocked by an administrator"
      );
    }

    const accessToken = strapi.plugins["users-permissions"].services[
      "jwt"
    ].issue(
      { id: user.id, ..._.pick(user, ["firstname", "lastname", "email"]) },
      { expiresIn: "5s" }
    );

    const refreshToken = strapi.plugins["users-permissions"].services[
      "jwt"
    ].issue({ id: user.id }, { expiresIn: "1y" });

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

    return response(
      ctx,
      200,
      "User authenticated successfully",
      await sanitizeOutput(
        user,
        ctx,
        strapi.getModel("plugin::users-permissions.user")
      ),
      refreshToken
    );
  };

  plugin.controllers.auth["connect"] = async (ctx) => {
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
    const accessToken = strapi.plugins["users-permissions"].services[
      "jwt"
    ].issue(
      { id: id, ..._.pick(ctx.user, ["firstname", "lastname", "email"]) },
      { expiresIn: "5s" }
    );
    ctx.cookies.set("accessToken", accessToken, { httpOnly: true });
    return response(
      ctx,
      200,
      "Access token has been refreshed successfully",
      undefined,
      refreshToken
    );
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
  plugin.routes["content-api"].routes.push(
    {
      method: "POST",
      path: "/auth/register",
      handler: "auth.register",
      config: {
        policies: [],
        prefix: "",
      },
    },
    {
      method: "POST",
      path: "/auth/login",
      handler: "auth.callback",
      config: {
        middlewares: [],
        policies: [],
        prefix: "",
      },
    },
    {
      method: "GET",
      path: "/auth/google",
      handler: "auth.connect",
      config: {
        middlewares: [],
        policies: [],
        prefix: "",
      },
    },
    {
      method: "GET",
      path: "/auth/refresh-token",
      handler: "auth.refreshToken",
      config: {
        middlewares: ["plugin::users-permissions.refresh"],
        policies: [],
        prefix: "",
      },
    },
    {
      method: "GET",
      path: "/auth/logout",
      handler: "auth.logout",
      config: {
        middlewares: ["plugin::users-permissions.access"],
        policies: [],
        prefix: "",
      },
    },
    {
      method: "GET",
      path: "/users",
      handler: "user.find",
      config: {
        middlewares: ["plugin::users-permissions.access"],
        prefix: "",
      },
    }
  );
  return plugin;
}
function validateGoogleAuthBody(body: any) {
  throw new Error("Function not implemented.");
}
