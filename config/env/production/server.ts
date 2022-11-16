export = ({ env }) => ({
  host: env("HOST", "0.0.0.0"),
  port: env.int("PORT", 1333),
  app: {
    keys: env.array("APP_KEYS"),
  },
  url: env("PUBLIC_URL", ""),
  proxy: true,
  jwt: env("JWT_SECRET"),
});
