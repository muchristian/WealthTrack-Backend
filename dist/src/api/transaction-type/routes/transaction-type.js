"use strict";
/**
 * transaction-type router.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const strapi_1 = require("@strapi/strapi");
const defaultRouter = strapi_1.factories.createCoreRouter("api::transaction-type.transaction-type");
const customRouter = (innerRouter, routeOveride = [], extraRoutes = []) => {
    let routes;
    return {
        get prefix() {
            return innerRouter.prefix;
        },
        get routes() {
            if (!routes)
                routes = innerRouter.routes;
            const obj = {};
            routeOveride.map((overide) => {
                obj[`${overide.method}-${overide.path}`] = overide;
            });
            const newRoutes = routes.map((route) => {
                const newRoute = obj[`${route.method}-${route.path}`];
                if (newRoute) {
                    return newRoute;
                }
                else {
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
        path: "/transaction-types",
        handler: "transaction-type.findAll",
        config: {
            middlewares: [],
        },
    },
];
exports.default = customRouter(defaultRouter, myOverideRoutes, myExtraRoutes);
