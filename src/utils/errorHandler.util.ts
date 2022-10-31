import Koa from "koa";
interface types {
  ctx: Koa.context;
  statusCode: number;
  message: string;
}

export const ErrorHandler = (
  ctx: types["ctx"],
  statusCode: types["statusCode"],
  message: types["message"]
) => {
  return ctx.throw(statusCode, message);
};
