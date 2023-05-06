"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@strapi/utils");
const callbackSchema = utils_1.yup
    .object({
    email: utils_1.yup.string().email().required(),
    password: utils_1.yup.string().required(),
})
    .noUnknown();
const registerSchema = utils_1.yup.object({
    firstname: utils_1.yup.string().required(),
    lastname: utils_1.yup.string().required(),
    email: utils_1.yup.string().email().required(),
    password: utils_1.yup.string().required(),
});
const validateEmailConfirmationSchema = utils_1.yup.object({
    confirmation: utils_1.yup.string().required(),
});
const forgotPasswordSchema = utils_1.yup
    .object({
    email: utils_1.yup.string().email().required(),
})
    .noUnknown();
const resetPasswordSchema = utils_1.yup
    .object({
    password: utils_1.yup.string().required(),
    confirmPassword: utils_1.yup
        .string()
        .required()
        .oneOf([utils_1.yup.ref("password")], "Passwords do not match"),
})
    .noUnknown();
const changePasswordSchema = utils_1.yup
    .object({
    password: utils_1.yup.string().required(),
    passwordConfirmation: utils_1.yup
        .string()
        .required()
        .oneOf([utils_1.yup.ref("password")], "Passwords do not match"),
    currentPassword: utils_1.yup.string().required(),
})
    .noUnknown();
exports.default = {
    validateLoginBody: (0, utils_1.validateYupSchema)(callbackSchema),
    validateRegisterBody: (0, utils_1.validateYupSchema)(registerSchema),
    validateEmailConfirmationBody: (0, utils_1.validateYupSchema)(validateEmailConfirmationSchema),
    validateForgotPasswordBody: (0, utils_1.validateYupSchema)(forgotPasswordSchema),
    validateResetPasswordBody: (0, utils_1.validateYupSchema)(resetPasswordSchema),
    validateChangePasswordBody: (0, utils_1.validateYupSchema)(changePasswordSchema),
};
