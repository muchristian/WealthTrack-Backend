"use strict";
/**
 * category router.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const strapi_1 = require("@strapi/strapi");
const defaultRouter = strapi_1.factories.createCoreRouter("api::category.category");
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
        path: "/categories",
        handler: "category.findAll",
        config: {
            middlewares: [],
        },
    },
    {
        // Path defined with a regular expression
        method: "POST",
        path: "/categories",
        handler: "category.create",
        config: {
            middlewares: [],
        },
    },
];
exports.default = customRouter(defaultRouter, myOverideRoutes, myExtraRoutes);
