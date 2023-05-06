"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = void 0;
const mail_1 = __importDefault(require("@sendgrid/mail"));
const logger_1 = __importDefault(require("./logger"));
mail_1.default.setApiKey(process.env.SENDGRID_API_KEY);
const sendEmail = (msg) => {
    mail_1.default
        .send(msg)
        .then((response) => {
        logger_1.default.info(response[0].statusCode);
        logger_1.default.info(response[0].headers);
    })
        .catch((error) => {
        logger_1.default.error(error);
    });
};
exports.sendEmail = sendEmail;
