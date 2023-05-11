"use strict";

/**
 * transaction service.
 */

import { factories } from "@strapi/strapi";
import { getActualDateRange, parseDate } from "../../../utils/date.util";
import Koa from "koa";

export default factories.createCoreService(
  "api::transaction.transaction",
  ({ strapi }) => ({
    async find(functions: {
      ctx: Koa.context;
      filter: {
        dateFrom: string;
        dateTo: string;
        search: string;
        user: number;
        start: number;
      };
    }) {
      const { ctx, filter } = functions;
      const { dateFrom, dateTo, search, user, start } = filter;
      let searchQuery = {};
      if (search)
        searchQuery = {
          category: {
            $containsi: search,
          },
        };
      const { actualStartDate, actualEndDate } = getActualDateRange(
        ctx,
        parseDate(ctx, dateFrom),
        parseDate(ctx, dateTo)
      );
      return await strapi.entityService.findMany(
        "api::transaction.transaction",
        {
          filters: {
            ...searchQuery,
            date: {
              $between: [actualStartDate, actualEndDate],
            },
            users_id: { id: user },
          },
          sort: { date: "desc" },
          start,
          limit: 10,
        }
      );
    },
    async create(data) {
      return strapi.entityService.create("api::transaction.transaction", {
        data,
      });
    },
    async findWallet(wallet) {
      return strapi.entityService.findMany("api::wallet.wallet", {
        filters: { name: wallet },
      });
    },
  })
);
