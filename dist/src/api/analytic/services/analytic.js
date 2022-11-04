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
const filterDataByDate = (data, type, date) => {
    const arr = [];
    for (const d of data) {
        const parsedDt = new Date(d.date);
        const result = (0, date_util_1.dateFormatBytype)(`${(0, date_fns_1.format)(parsedDt, "dd")}-${(0, date_fns_1.format)(parsedDt, "MM")}-${(0, date_fns_1.format)(parsedDt, "yyyy")}`, type) === date;
        if (result) {
            arr.push(arr, d);
        }
        continue;
    }
    return arr;
};
exports.default = strapi_1.factories.createCoreService("api::analytic.analytic", ({ strapi }) => ({
    async find(functions) {
        const { ctx, filter, type } = functions;
        const { actualStartDate, actualEndDate } = (0, date_util_1.getActualDateRange)(ctx, (0, date_util_1.parseDate)(ctx, filter.dateFrom), (0, date_util_1.parseDate)(ctx, filter.dateTo));
        const dates = (0, date_fns_1.eachDayOfInterval)({
            start: actualStartDate,
            end: actualEndDate,
        }).map((d) => (0, date_util_1.dateFormatBytype)(`${(0, date_fns_1.format)(d, "dd")}-${(0, date_fns_1.format)(d, "MM")}-${(0, date_fns_1.format)(d, "yyyy")}`, type));
        const transactions = await strapi.entityService.findMany("api::transaction.transaction", {
            filters: {
                date: {
                    $between: [actualStartDate, actualEndDate],
                },
            },
        });
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
            const transactionsByDate = filterDataByDate(transactions, "day", date);
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
        for (const key of Object.keys(totalAmountUsedByEachExpense)) {
            const value = Object.values(totalAmountUsedByEachExpense).reduce((sum, t) => sum + t.amount, 0);
            totalAmountUsedByEachExpense[key].percentage = Math.round((totalAmountUsedByEachExpense[key].amount / +value) * 100);
            totalAmountUsedByEachExpenseResult.push({
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
            },
            transactionsAnalytics: transactionsByType,
            walletsAnalytics: totalTransactionsBywallet,
            expensesAnalytics: totalAmountUsedByEachExpenseResult,
        };
    },
}));
