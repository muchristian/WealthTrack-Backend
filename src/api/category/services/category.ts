/**
 * category service.
 */

import { factories } from "@strapi/strapi";
import utils from "@strapi/utils";
import { getActualDateRange, parseDate } from "../../../utils/date.util";
import Koa from "koa";
import { ErrorHandler } from "../../../utils/errorHandler.util";
const { ApplicationError, ValidationError } = utils.errors;

export default factories.createCoreService(
  "api::category.category",
  ({ strapi }) => ({
    async find(queries: any) {
      const { transactionType } = queries;
      return strapi.entityService.findMany("api::category.category", {
        filters: {
          transaction_type: {
            name: {
              $eq: transactionType,
            },
          },
        },
      });
    },

    async findMany(ctx: Koa.context, queries) {
      const { user, dateFrom, dateTo } = queries;
      console.log("fdsafdsa", user);
      const { actualStartDate, actualEndDate } = getActualDateRange(
        ctx,
        parseDate(ctx, dateFrom),
        parseDate(ctx, dateTo)
      );
      console.log(actualEndDate);
      console.log(actualStartDate);
      const categories = await strapi.entityService.findMany(
        "api::category.category",
        {
          sort: { createdAt: "asc" },
          populate: {
            transaction_type: true,
          },
          filters: {
            users_permissions_user: { id: user },
          },
        }
      );
      console.log(categories);

      const transactions = await strapi.entityService.findMany(
        "api::transaction.transaction",
        {
          filters: {
            users_id: { id: user },
            date: {
              $between: [actualStartDate, actualEndDate],
            },
          },
          fields: ["category", "id", "amount"],
        }
      );
      console.log(transactions);
      let res = [];
      let obj = {};
      if (transactions.length > 0) {
        for (let t of transactions) {
          if (!(t.category in obj)) {
            obj[t.category] = 0;
            obj[t.category] += t.amount;
          } else {
            obj[t.category] += t.amount;
          }
        }
      }
      console.log(categories);
      console.log(obj);
      for (let el of categories) {
        if (obj[el.name.toLowerCase()]) {
          const usedBudget = el.budget - obj[el.name.toLowerCase()];
          const usedBudgetPercentage = Math.round(
            (obj[el.name.toLowerCase()] / el.budget) * 100
          );
          const usedBudgetColor =
            usedBudgetPercentage > 100
              ? "bg-red-100 text-red-800"
              : usedBudgetPercentage <= 100 && usedBudgetPercentage > 80
              ? "#FFBB38"
              : "#30BE36";
          res.push({
            ...el,
            usedBudget,
            usedBudgetPercentage,
            usedBudgetColor,
          });
        } else {
          res.push({
            ...el,
          });
        }
      }

      console.log(res);
      return res;
    },

    async create(data: any) {
      console.log("ddd", data);
      return strapi.entityService.create("api::category.category", {
        data: {
          ...data,
          name: data.name.toLowerCase(),
        },
      });
    },
  })
);
