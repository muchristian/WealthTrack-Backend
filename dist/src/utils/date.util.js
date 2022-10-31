"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getActualDateRange = exports.parseDate = exports.dateFormatBytype = void 0;
const date_fns_1 = require("date-fns");
const errorHandler_util_1 = require("./errorHandler.util");
const dateFormatBytype = (date, type = "day") => {
    switch (type) {
        case "day":
            return date;
        case "month":
            return date.split("-").splice(0, 1).join("-");
        case "year": {
            const arr = date.split("-");
            for (let i = 0; i <= 1; i++) {
                arr.splice(i, 1);
            }
            return arr.join("-");
        }
    }
};
exports.dateFormatBytype = dateFormatBytype;
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
