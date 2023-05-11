import { endOfDay, subDays } from "date-fns";
import Koa from "koa";
import { ErrorHandler } from "./errorHandler.util";

export const getDataBytype = (data: any, type: string = "day"): {}[] => {
  if (type === "day") {
    const newDate = new Date(reverse(data[0].date));
    return data;
  } else {
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
      groups[date] = Object.assign(groups[date], {
        expense: groups[date].expense + d.expense,
        "debt/loan": groups[date]["debt/loan"] + d["debt/loan"],
        income: groups[date].income + d.income,
      });
      return groups;
    }, {});
    return Object.values(groups);
  }
};

const reverse = (date: string) => {
  return date.split("-").reverse().join("-");
};

const dateFormByType = (date: Date, type: string) => {
  return type === "month"
    ? date.toLocaleString("en-us", { month: "short", year: "numeric" })
    : date.toLocaleString("en-us", { year: "numeric" });
};

const getMonth = (month: string) => {};

export const parseDate = (ctx, d: string): Date => {
  if (d !== "" && !/^(\d{4})-(\d{2})-(\d{2})$/.test(d))
    return ErrorHandler(ctx, 400, "Date must be a date format (2020-01-01)");
  return d === "" ? null : new Date(d);
};

export const getActualDateRange = (
  ctx: Koa.context,
  startDate?: Date,
  endDate?: Date
): { actualStartDate: Date; actualEndDate: Date } => {
  const actualStartDate = startDate ? startDate : subDays(new Date(), 7);
  const actualEndDate = endDate ? endOfDay(endDate) : endOfDay(new Date());
  if (actualStartDate > actualEndDate) {
    return ErrorHandler(ctx, 400, "DateFrom should not be greater than dateTo");
  }
  return {
    actualStartDate,
    actualEndDate,
  };
};
