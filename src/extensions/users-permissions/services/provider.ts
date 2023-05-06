// import { ErrorHandler } from "../../../utils/errorHandler.util";

// export const verifyUser = (provider, query) => {
//   const refreshToken = ctx.cookies.get("refreshToken");
//   const isRefreshTokenExist = await strapi.db
//     .query("plugin::users-permissions.user")
//     .findOne({
//       where: {
//         refreshToken,
//       },
//     });
//   if (!isRefreshTokenExist) {
//     return ErrorHandler(ctx, 401, "Unauthorized");
//   }
//   ctx.user = isRefreshTokenExist;
//   return next();
// };

// async run({ provider, access_token, query, providers }) {
//     if (!providersCallbacks[provider]) {
//       throw new Error('Unknown provider.');
//     }

//     const providerCb = providersCallbacks[provider];

//     return providerCb({ access_token, query, providers });
//   },
