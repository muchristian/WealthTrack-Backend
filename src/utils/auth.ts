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
  try {
    console.log(token);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(decoded);
    return { payload: decoded, expired: false };
  } catch (error) {
    return { payload: null, expired: error.message.includes("jwt expired") };
  }
};
