"use strict";
const path = require("path");
const parseDbUrl = require("parse-database-url");
const dbConfig = parseDbUrl(process.env.DATABASE_URL);
module.exports = ({ env }) => ({
    connection: {
        client: "postgres",
        connection: {
            host: env("DATABASE_HOST") || dbConfig.host,
            port: env.int("DATABASE_PORT") || dbConfig.port,
            database: env("DATABASE_NAME") || dbConfig.database,
            user: env("DATABASE_USERNAME") || dbConfig.user,
            password: env("DATABASE_PASSWORD") || dbConfig.password,
            ssl: {
                rejectUnauthorized: env.bool("DATABASE_SSL_SELF", false),
            },
        },
        debug: false,
    },
});
