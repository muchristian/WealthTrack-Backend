"use strict";
module.exports = ({ env }) => ({
    host: env("HOST", "0.0.0.0"),
    port: env.int("PORT", 1333),
    app: {
        keys: env.array("APP_KEYS"),
    },
    url: "https://bc5a-102-22-172-160.ngrok-free.app",
    proxy: true,
    jwt: env("JWT_SECRET"),
});
