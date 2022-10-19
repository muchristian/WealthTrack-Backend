import jwt from "jsonwebtoken";
import _ from "lodash";
import config from "../../config/server";

export const generateToken = (data, expire = "5m") => {
  const tokenData = _.omit(data, "password");
  const token = jwt.sign(tokenData, process.env.JWT_SECRET, {
    expiresIn: `${expire}`,
  });
  return token;
};
export const verifyToken = (token) => {
  const result = strapi.plugins["users-permissions"].services["jwt"]
    .verify(token)
    .then((decoded) => {
      return {
        payload: decoded,
        expired: false,
      };
    })
    .catch((error) => {
      return {
        payload: null,
        expired: error.message.includes("Invalid token."),
      };
    });
  return result;
};
