import Koa from "koa";
interface types {
  ctx: Koa.context;
  statusCode: number;
  message?: string;
  data: any;
  token?: string;
}

export const response = (
  ctx: types["ctx"],
  statusCode: types["statusCode"],
  message: types["message"],
  data: types["data"],
  token: types["token"]
) => {
  return ctx.send(
    {
      message,
      data,
      token,
    },
    statusCode
  );
};
