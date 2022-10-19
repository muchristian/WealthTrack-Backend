export const success = (message: string, data: any, token?: string) => {
  return {
    message,
    data,
    token,
  };
};
