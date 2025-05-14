import Joi from "joi";
import { generalFields } from "../../middlewares/validation.middleware.js";

export const viewProfile = Joi.object().keys({
    profileId: generalFields.id.required()
}).required()

export const updateSimpleInfo = Joi.object().keys({
    userName: generalFields.userName,
    DOB: generalFields.DOB,
    phone: generalFields.phone,
    gender: generalFields.gender
}).required()

export const updatePassword = Joi.object().keys({
    oldPassword: generalFields.password.required(),
    password: generalFields.password.not(Joi.ref("oldPassword")).required(),
    confirmPassword: generalFields.confirmPassword.valid(Joi.ref("password")).required(),
}).required()

export const updateEmail = Joi.object().keys({
    email: generalFields.email.required(),
}).required()

export const replaceEmail = Joi.object().keys({
    oldEmailOTP: generalFields.code.required(),
    newEmailOTP: generalFields.code.required(),
}).required()