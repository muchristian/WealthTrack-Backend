/**
 * analytic router.
 */

import { factories } from "@strapi/strapi";

const analyticRoutes = {
  routes: [
    {
      method: "GET",
      path: "/analytics",
      handler: "analytic.findAll",
    },
  ],
};

export default analyticRoutes;
