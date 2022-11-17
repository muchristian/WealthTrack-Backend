/**
 * analytic service.
 */

import { factories } from "@strapi/strapi";
import { eachDayOfInterval, eachMonthOfInterval, format } from "date-fns";
import Koa from "koa";
import {
  getDataBytype,
  getActualDateRange,
  parseDate,
} from "../../../utils/date.util";

const filterData = (data, attr, type) => {
  return data.filter((d) => d[attr] == type);
};

const filterDataByDate = (data, date, type) => {
  const arr = [];
  for (const d of data) {
    const parsedDt = new Date(d.date);
    const dateFormat =
      type !== "year"
        ? `${format(parsedDt, "dd")}-${format(parsedDt, "MM")}-${format(
            parsedDt,
            "yyyy"
          )}`
        : `${format(parsedDt, "MM")}-${format(parsedDt, "yyyy")}`;
    const result = dateFormat === date;

    if (result) {
      arr.push(arr, d);
    }
    continue;
  }
  return arr;
};

export default factories.createCoreService(
  "api::analytic.analytic",
  ({ strapi }) => ({
    async find(functions: {
      ctx: Koa.context;
      filter: { dateFrom: string; dateTo: string };
      type: string;
      user: number;
    }) {
      const { ctx, filter, type, user } = functions;
      const { actualStartDate, actualEndDate } = getActualDateRange(
        ctx,
        parseDate(ctx, filter.dateFrom),
        parseDate(ctx, filter.dateTo)
      );

      let dates;
      if (type !== "year") {
        dates = eachDayOfInterval({
          start: actualStartDate,
          end: actualEndDate,
        }).map(
          (d) => `${format(d, "dd")}-${format(d, "MM")}-${format(d, "yyyy")}`
        );
      } else {
        dates = eachMonthOfInterval({
          start: actualStartDate,
          end: actualEndDate,
        }).map((d) => `${format(d, "MM")}-${format(d, "yyyy")}`);
      }
      console.log("ddsa", user);
      const transactions = await strapi.entityService.findMany(
        "api::transaction.transaction",
        {
          filters: {
            date: {
              $between: [actualStartDate, actualEndDate],
            },
            users_id: { id: user },
          },
        }
      );

      const transactionsObj = {
        expense: 0,
        "debt/loan": 0,
        income: 0,
      };

      for (const transaction of transactions) {
        if (transactionsObj[transaction.transaction_type.toLowerCase()])
          transactionsObj[transaction.transaction_type.toLowerCase()].push(
            transaction
          );
      }

      const transactionsByType = [];
      for (const date of dates) {
        const transactionsByDate = filterDataByDate(transactions, date, type);
        const expenseData = filterData(
          transactionsByDate,
          "transaction_type",
          "Expense"
        );
        const debt = filterData(
          transactionsByDate,
          "transaction_type",
          "Debt/Loan"
        );
        const income = filterData(
          transactionsByDate,
          "transaction_type",
          "Income"
        );
        transactionsByType.push({
          date,
          expense: expenseData.reduce((sum: number, e) => {
            const result = sum + e.amount;
            transactionsObj["expense"] = result;
            return result;
          }, transactionsObj["expense"]),
          "debt/loan": debt.reduce((sum: number, d) => {
            const result = sum + d.amount;
            transactionsObj["debt/loan"] = result;
            return result;
          }, transactionsObj["debt/loan"]),
          income: income.reduce((sum: number, i) => {
            const result = sum + i.amount;
            transactionsObj["income"] = result;
            return result;
          }, transactionsObj["income"]),
        });
      }

      const totalTransactionsBywallet = {
        bank: Math.round(
          (filterData(transactions, "wallet", "Bank").length /
            transactions.length) *
            100
        ),
        crypto: Math.round(
          (filterData(transactions, "wallet", "Crypto").length /
            transactions.length) *
            100
        ),
        momo: Math.round(
          (filterData(transactions, "wallet", "Mobile money").length /
            transactions.length) *
            100
        ),
      };

      const totalAmountUsedByEachExpense = {};
      const totalAmountUsedByEachExpenseResult = [];
      const expenses = transactions.filter(
        (t) => t.transaction_type === "Expense"
      );
      for (const expense of expenses) {
        if (!totalAmountUsedByEachExpense[expense.category]) {
          totalAmountUsedByEachExpense[expense.category] = {
            amount: +expense.amount,
            percentage: 0,
          };
        } else {
          totalAmountUsedByEachExpense[expense.category].amount +=
            +expense.amount;
        }
      }

      for (const key of Object.keys(totalAmountUsedByEachExpense)) {
        const value = Object.values(totalAmountUsedByEachExpense).reduce(
          (sum: number, t: { amount: number; percentage: number }) =>
            sum + t.amount,
          0
        );
        totalAmountUsedByEachExpense[key].percentage = Math.round(
          (totalAmountUsedByEachExpense[key].amount / +value) * 100
        );
        totalAmountUsedByEachExpenseResult.push({
          name: key,
          amount: totalAmountUsedByEachExpense[key].amount,
          percentage: totalAmountUsedByEachExpense[key].percentage,
        });
      }

      return {
        transactionsTypesTotal: {
          income: transactionsByType[transactionsByType.length - 1]["income"],
          "debt/loan":
            transactionsByType[transactionsByType.length - 1]["debt/loan"],
          expense: transactionsByType[transactionsByType.length - 1]["expense"],
          total_transactions: transactions.length,
        },
        transactionsAnalytics: getDataBytype(transactionsByType),
        walletsAnalytics: totalTransactionsBywallet,
        expensesAnalytics: totalAmountUsedByEachExpenseResult,
      };
    },
  })
);
