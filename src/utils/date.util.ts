import { endOfDay, subDays } from "date-fns";
import Koa from "koa";
import { ErrorHandler } from "./errorHandler.util";

export const dateFormatBytype = (
  date: string,
  type: string = "day"
): string => {
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
