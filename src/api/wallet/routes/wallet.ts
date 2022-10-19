"use strict";

/**
 * wallet router.
 */

import { factories } from "@strapi/strapi";
import * as middlewares from "../../../middlewares/auth";

const defaultRouter = factories.createCoreRouter("api::wallet.wallet");

const customRouter = (
  innerRouter: any,
  routeOveride = [],
  extraRoutes = []
) => {
  let routes;
  return {
    get prefix() {
      return innerRouter.prefix;
    },
    get routes() {
      if (!routes) routes = innerRouter.routes;
      const obj = {};
      routeOveride.map((overide) => {
        obj[`${overide.method}-${overide.path}`] = overide;
      });
      const newRoutes = routes.map((route) => {
        const newRoute = obj[`${route.method}-${route.path}`];
        if (newRoute) {
          return newRoute;
        } else {
          return route;
        }
      });
      return newRoutes.concat(extraRoutes);
    },
  };
};
const myExtraRoutes = [];
const myOverideRoutes = [
  {
    // Path defined with a regular expression
    method: "GET",
    path: "/wallets", // Only match when the URL parameter is composed of lowercase letters
    handler: "wallet.findAll",
    config: {
      middlewares: [
        // middlewares.auth(strapi)
      ],
    },
  },
];

export default customRouter(defaultRouter, myOverideRoutes, myExtraRoutes);
