"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getActualDateRange = exports.parseDate = exports.getDataBytype = void 0;
const date_fns_1 = require("date-fns");
const errorHandler_util_1 = require("./errorHandler.util");
const getDataBytype = (data, type = "day") => {
    if (type === "day") {
        console.log(data[0].date);
        const newDate = new Date(reverse(data[0].date));
        console.log(newDate);
        return data;
    }
    else {
        const groups = data.reduce((groups, d) => {
            const date = dateFormByType(new Date(reverse(d.date)), type);
            if (!groups[date]) {
                groups[date] = {
                    date: "",
                    expense: 0,
                    "debt/loan": 0,
                    income: 0,
                };
            }
            console.log(d);
            console.log(groups[date].expense);
            groups[date] = Object.assign(groups[date], {
                expense: groups[date].expense + d.expense,
                "debt/loan": groups[date]["debt/loan"] + d["debt/loan"],
                income: groups[date].income + d.income,
            });
            return groups;
        }, {});
        console.log(Object.values(groups));
        return Object.values(groups);
    }
};
exports.getDataBytype = getDataBytype;
const reverse = (date) => {
    return date.split("-").reverse().join("-");
};
const dateFormByType = (date, type) => {
    console.log(date);
    return type === "month"
        ? date.toLocaleString("en-us", { month: "short", year: "numeric" })
        : date.toLocaleString("en-us", { year: "numeric" });
};
const getMonth = (month) => { };
const parseDate = (ctx, d) => {
    if (d !== "" && !/^(\d{4})-(\d{2})-(\d{2})$/.test(d))
        return (0, errorHandler_util_1.ErrorHandler)(ctx, 400, "Date must be a date format (2020-01-01)");
    return d === "" ? null : new Date(d);
};
exports.parseDate = parseDate;
const getActualDateRange = (ctx, startDate, endDate) => {
    const actualStartDate = startDate ? startDate : (0, date_fns_1.subDays)(new Date(), 7);
    const actualEndDate = endDate ? (0, date_fns_1.endOfDay)(endDate) : (0, date_fns_1.endOfDay)(new Date());
    if (actualStartDate > actualEndDate) {
        return (0, errorHandler_util_1.ErrorHandler)(ctx, 400, "DateFrom should not be greater than dateTo");
    }
    return {
        actualStartDate,
        actualEndDate,
    };
};
exports.getActualDateRange = getActualDateRange;
