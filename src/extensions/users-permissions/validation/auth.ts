"use strict";

import { yup, validateYupSchema } from "@strapi/utils";

const callbackSchema = yup
  .object({
    email: yup.string().email().required(),
    password: yup.string().required(),
  })
  .noUnknown();

const validateGoogleAuthBody = yup.object({
  email: yup.string().email().required(),
});

const registerSchema = yup.object({
  firstname: yup.string().required(),
  lastname: yup.string().required(),
  email: yup.string().email().required(),
  password: yup.string().required(),
});

const sendEmailConfirmationSchema = yup.object({
  email: yup.string().email().required(),
});

const validateEmailConfirmationSchema = yup.object({
  confirmation: yup.string().required(),
});

const forgotPasswordSchema = yup
  .object({
    email: yup.string().email().required(),
  })
  .noUnknown();

const resetPasswordSchema = yup
  .object({
    password: yup.string().required(),
    passwordConfirmation: yup.string().required(),
    code: yup.string().required(),
  })
  .noUnknown();

const changePasswordSchema = yup
  .object({
    password: yup.string().required(),
    passwordConfirmation: yup
      .string()
      .required()
      .oneOf([yup.ref("password")], "Passwords do not match"),
    currentPassword: yup.string().required(),
  })
  .noUnknown();

export default {
  validateLoginBody: validateYupSchema(callbackSchema),
  validateRegisterBody: validateYupSchema(registerSchema),
  validateSendEmailConfirmationBody: validateYupSchema(
    sendEmailConfirmationSchema
  ),
  validateEmailConfirmationBody: validateYupSchema(
    validateEmailConfirmationSchema
  ),
  validateForgotPasswordBody: validateYupSchema(forgotPasswordSchema),
  validateResetPasswordBody: validateYupSchema(resetPasswordSchema),
  validateChangePasswordBody: validateYupSchema(changePasswordSchema),
};
