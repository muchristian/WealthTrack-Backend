import sgMail from "@sendgrid/mail";
import logger from "./logger";
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export const sendEmail = (msg) => {
  sgMail
    .send(msg)
    .then((response) => {
      logger.info(response[0].statusCode);
      logger.info(response[0].headers);
    })
    .catch((error) => {
      logger.error(error);
    });
};
