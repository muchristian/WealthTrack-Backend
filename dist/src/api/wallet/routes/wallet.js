"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * wallet router.
 */
const strapi_1 = require("@strapi/strapi");
const defaultRouter = strapi_1.factories.createCoreRouter("api::wallet.wallet");
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
        path: "/wallets",
        handler: "wallet.findAll",
        config: {
            middlewares: [
            // middlewares.auth(strapi)
            ],
        },
    },
];
exports.default = customRouter(defaultRouter, myOverideRoutes, myExtraRoutes);
