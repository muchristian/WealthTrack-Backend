import utils from "@strapi/utils";
const { sanitize } = utils;

export const sanitizeOutput = (data, ctx, schema) => {
  const { response } = ctx.state;
  return sanitize.contentAPI.output(data, schema, {
    response,
  });
};
