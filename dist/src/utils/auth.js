"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = exports.generateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const lodash_1 = __importDefault(require("lodash"));
const generateToken = (data, expire = "5m") => {
    const tokenData = lodash_1.default.omit(data, "password");
    const token = jsonwebtoken_1.default.sign(tokenData, process.env.JWT_SECRET, {
        expiresIn: `${expire}`,
    });
    return token;
};
exports.generateToken = generateToken;
const verifyToken = (token) => {
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
exports.verifyToken = verifyToken;
