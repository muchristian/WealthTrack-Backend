"use strict";
const path = require("path");
const parseDbUrl = require("parse-database-url");
const dbConfig = parseDbUrl(process.env.DATABASE_URL);
module.exports = ({ env }) => ({
    connection: {
        client: "postgres",
        connection: {
            host: dbConfig.host,
            port: dbConfig.port,
            database: dbConfig.database,
            user: dbConfig.user,
            password: dbConfig.password,
            ssl: {
                rejectUnauthorized: env.bool("DATABASE_SSL_SELF", false),
            },
        },
        options: {
            ssl: false,
        },
        debug: false,
    },
});
