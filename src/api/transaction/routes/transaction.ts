"use strict";

/**
 * transaction router.
 */

import { factories } from "@strapi/strapi";

const defaultRouter = factories.createCoreRouter(
  "api::transaction.transaction"
);

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
    path: "/transactions", // Only match when the URL parameter is composed of lowercase letters
    handler: "transaction.findAll",
    config: {
      middlewares: [
        // middlewares.auth(strapi)
      ],
    },
  },
  {
    // Path defined with a regular expression
    method: "POST",
    path: "/transactions", // Only match when the URL parameter is composed of lowercase letters
    handler: "transaction.createTransaction",
    config: {
      middlewares: [
        // middlewares.auth(strapi)
      ],
    },
  },
];

export default customRouter(defaultRouter, myOverideRoutes, myExtraRoutes);
