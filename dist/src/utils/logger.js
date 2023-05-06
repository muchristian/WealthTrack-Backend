"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const winston = require("winston");
const logger = winston.createLogger({
    transports: [new winston.transports.Console()],
});
exports.default = logger;
