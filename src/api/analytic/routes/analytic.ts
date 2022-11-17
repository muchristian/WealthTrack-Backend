/**
 * analytic router.
 */

import { factories } from "@strapi/strapi";
import { access } from "../../../middlewares/auth";

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
