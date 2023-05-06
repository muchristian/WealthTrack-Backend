"use strict";
/**
 * analytic service.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const strapi_1 = require("@strapi/strapi");
const date_fns_1 = require("date-fns");
const date_util_1 = require("../../../utils/date.util");
const filterData = (data, attr, type) => {
    return data.filter((d) => d[attr] == type);
};
const filterDataByDate = (data, date, type) => {
    const arr = [];
    for (const d of data) {
        const parsedDt = new Date(d.date);
        const dateFormat = type !== "year"
            ? `${(0, date_fns_1.format)(parsedDt, "dd")}-${(0, date_fns_1.format)(parsedDt, "MM")}-${(0, date_fns_1.format)(parsedDt, "yyyy")}`
            : `${(0, date_fns_1.format)(parsedDt, "MM")}-${(0, date_fns_1.format)(parsedDt, "yyyy")}`;
        const result = dateFormat === date;
        if (result) {
            arr.push(arr, d);
        }
        continue;
    }
    return arr;
};
exports.default = strapi_1.factories.createCoreService("api::analytic.analytic", ({ strapi }) => ({
    async find(functions) {
        const { ctx, filter, type, user } = functions;
        const { actualStartDate, actualEndDate } = (0, date_util_1.getActualDateRange)(ctx, (0, date_util_1.parseDate)(ctx, filter.dateFrom), (0, date_util_1.parseDate)(ctx, filter.dateTo));
        let dates;
        if (type !== "year") {
            dates = (0, date_fns_1.eachDayOfInterval)({
                start: actualStartDate,
                end: actualEndDate,
            }).map((d) => `${(0, date_fns_1.format)(d, "dd")}-${(0, date_fns_1.format)(d, "MM")}-${(0, date_fns_1.format)(d, "yyyy")}`);
        }
        else {
            dates = (0, date_fns_1.eachMonthOfInterval)({
                start: actualStartDate,
                end: actualEndDate,
            }).map((d) => `${(0, date_fns_1.format)(d, "MM")}-${(0, date_fns_1.format)(d, "yyyy")}`);
        }
        console.log("ddsa", user);
        const transactions = await strapi.entityService.findMany("api::transaction.transaction", {
            filters: {
                date: {
                    $between: [actualStartDate, actualEndDate],
                },
                users_id: { id: user },
            },
        });
        const budgets = await strapi.entityService.findMany("api::category.category", {
            populate: {
                transaction_type: true,
            },
            filters: {
                users_permissions_user: { id: user },
            },
        });
        console.log(budgets);
        const transactionsObj = {
            expense: 0,
            "debt/loan": 0,
            income: 0,
        };
        for (const transaction of transactions) {
            if (transactionsObj[transaction.transaction_type.toLowerCase()])
                transactionsObj[transaction.transaction_type.toLowerCase()].push(transaction);
        }
        const transactionsByType = [];
        for (const date of dates) {
            const transactionsByDate = filterDataByDate(transactions, date, type);
            const expenseData = filterData(transactionsByDate, "transaction_type", "Expense");
            const debt = filterData(transactionsByDate, "transaction_type", "Debt/Loan");
            const income = filterData(transactionsByDate, "transaction_type", "Income");
            transactionsByType.push({
                date,
                expense: expenseData.reduce((sum, e) => {
                    const result = sum + e.amount;
                    transactionsObj["expense"] = result;
                    return result;
                }, transactionsObj["expense"]),
                "debt/loan": debt.reduce((sum, d) => {
                    const result = sum + d.amount;
                    transactionsObj["debt/loan"] = result;
                    return result;
                }, transactionsObj["debt/loan"]),
                income: income.reduce((sum, i) => {
                    const result = sum + i.amount;
                    transactionsObj["income"] = result;
                    return result;
                }, transactionsObj["income"]),
            });
        }
        const totalTransactionsBywallet = {
            bank: Math.round((filterData(transactions, "wallet", "Bank").length /
                transactions.length) *
                100),
            crypto: Math.round((filterData(transactions, "wallet", "Crypto").length /
                transactions.length) *
                100),
            momo: Math.round((filterData(transactions, "wallet", "Mobile money").length /
                transactions.length) *
                100),
        };
        const budgetsObj = {};
        for (const budget of budgets) {
            if (budget.transaction_type.name === "Expense") {
                if (!budgetsObj[budget.name]) {
                    budgetsObj[budget.name] = {
                        ...budget,
                    };
                }
            }
        }
        const totalAmountUsedByEachExpense = {};
        const totalAmountUsedByEachExpenseResult = [];
        const expenses = transactions.filter((t) => t.transaction_type === "Expense");
        for (const expense of expenses) {
            if (!totalAmountUsedByEachExpense[expense.category]) {
                totalAmountUsedByEachExpense[expense.category] = {
                    amount: +expense.amount,
                    percentage: 0,
                };
            }
            else {
                totalAmountUsedByEachExpense[expense.category].amount +=
                    +expense.amount;
            }
        }
        console.log(totalAmountUsedByEachExpense);
        for (const key of Object.keys(totalAmountUsedByEachExpense)) {
            totalAmountUsedByEachExpense[key].percentage = Math.round((totalAmountUsedByEachExpense[key].amount * 100) /
                budgetsObj[key].budget);
            totalAmountUsedByEachExpenseResult.push({
                id: budgetsObj[key].id,
                name: key,
                amount: totalAmountUsedByEachExpense[key].amount,
                percentage: totalAmountUsedByEachExpense[key].percentage,
            });
        }
        return {
            transactionsTypesTotal: {
                income: transactionsByType[transactionsByType.length - 1]["income"],
                "debt/loan": transactionsByType[transactionsByType.length - 1]["debt/loan"],
                expense: transactionsByType[transactionsByType.length - 1]["expense"],
                total_transactions: transactions.length,
            },
            transactionsAnalytics: (0, date_util_1.getDataBytype)(transactionsByType),
            walletsAnalytics: totalTransactionsBywallet,
            expensesAnalytics: totalAmountUsedByEachExpenseResult
                .sort((a, b) => {
                return a.percentage - b.percentage;
            })
                .slice(0, 5),
        };
    },
}));
