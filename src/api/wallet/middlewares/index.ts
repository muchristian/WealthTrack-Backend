export const auth = (config, { strapi }) => {
  return async (ctx, next) => {
    await next();
  };
};
