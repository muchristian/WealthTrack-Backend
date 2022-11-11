"use strict";
/**
 * analytic router.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const analyticRoutes = {
    routes: [
        {
            method: "GET",
            path: "/analytics",
            handler: "analytic.findAll",
        },
    ],
};
exports.default = analyticRoutes;
