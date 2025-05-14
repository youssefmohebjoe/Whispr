import Joi from "joi"
import { Types } from "mongoose"
import { genderTypes } from "../DB/model/User.model.js"

const checkObjectId = (value, helper) => {
    return Types.ObjectId.isValid(value) ? true : helper.message("Invalid ObjectId")
}

const fileObject = {
    fieldname: Joi.string(),
    originalname: Joi.string(),
    encoding: Joi.string(),
    mimetype: Joi.string(),
    destination: Joi.string(),
    filename: Joi.string(),
    path: Joi.string(),
    size: Joi.number(),
}

export const generalFields = {
    userName: Joi.string().min(2).max(25).trim(),
    email: Joi.string().email(
        {
            tlds: { allow: ['com', 'net'] },
            minDomainSegments: 2,
            maxDomainSegments: 3
        }).messages(
            {
                'string.empty': 'Email is required',
                'string.email': 'Invalid email address',
                'any.required': 'Email is required'
            }
        ),
    password: Joi.string().pattern(
        new RegExp(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/)
    ),
    confirmPassword: Joi.string(),
    code: Joi.string().pattern(new RegExp(/^\d{6}$/)),
    id: Joi.string().custom(checkObjectId),
    DOB: Joi.date().less("now"),
    phone: Joi.string().pattern(new RegExp(/^(002|\+2)?01[0125][0-9]{8}$/)),
    gender: Joi.string().valid(...Object.values(genderTypes)),
    fileObject,
    file: Joi.object(fileObject)
}


export const validation = (schema) => {
    return (req, res, next) => {

        const inputData = { ...req.body, ...req.params, ...req.query }
        if (req.file || req.files?.length) {
            inputData.file = req.file || req.files
        }

        const validationResult = schema.validate(inputData, { abortEarly: false })
        if (validationResult.error) {
            return res.status(400).json(
                {
                    message: "Validation error",
                    details: validationResult.error.details
                }
            )
        }
        return next()
    }
}

export const graphValidation = ({ schema, args = {} } = {}) => {

    const validationResult = schema.validate(args, { abortEarly: false })
    if (validationResult.error) {
        throw new Error(JSON.stringify({
            message: "Validation error",
            details: validationResult.error.details
        }))
    }
    return true
}