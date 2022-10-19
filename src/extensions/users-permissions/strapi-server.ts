import * as validations from "./validation/auth";
import utils from "@strapi/utils";
import { hashPassword } from "./utils/auth";
import { sanitizeOutput } from "./utils/sanitize";
import { success } from "./utils/response";
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
      throw new ValidationError("Email are already taken");
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

    return success(
      "User authenticated successfully",
      await sanitizeOutput(
        result,
        ctx,
        strapi.getModel("plugin::users-permissions.user")
      )
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
    const validPassword = strapi.plugins["users-permissions"].services[
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

    ctx.cookies.set("accessToken", accessToken, { httpOnly: true });
    ctx.cookies.set("refreshToken", refreshToken, { httpOnly: true });

    return success(
      "User authenticated successfully",
      await sanitizeOutput(
        user,
        ctx,
        strapi.getModel("plugin::users-permissions.user")
      )
    );
  };

  plugin.controllers.user["me"] = async (ctx) => {
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
        policies: [],
        prefix: "",
      },
    },
    {
      method: "GET",
      path: "/users/me",
      handler: "user.me",
      config: {
        middlewares: ["plugin::users-permissions.auth"],
        prefix: "",
      },
    }
  );
  return plugin;
}
