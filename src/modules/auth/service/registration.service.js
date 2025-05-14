import { userModel } from "../../../DB/model/User.model.js";
import { emailEvent } from "../../../utils/events/email.event.js";
import { asyncHandler } from "../../../utils/response/error.response.js"
import { successResponse } from "../../../utils/response/success.response.js";
import { compareHash, generateHash } from "../../../utils/security/hash.security.js";
import * as dbService from "../../../DB/db.service.js"

export const register = asyncHandler(
    async (req, res, next) => {
        const { userName, email, password } = req.body
        if (await dbService.findOne({ model: userModel, filter: { email } })) {
            return next(new Error("Email exists", { cause: 409 }))
        }
        const user = await dbService.create({
            model: userModel,
            data: {
                userName,
                email,
                password: generateHash({ plainText: password })
            },
        })
        emailEvent.emit('sendConfirmEmail', { id: user._d, email })
        return successResponse({ res, message: "Registered", status: 201, data: { user: user._id } })
    }
)

export const confirmEmail = asyncHandler(
    async (req, res, next) => {
        const { email, code } = req.body
        const user = await dbService.findOne({ model: userModel, filter: { email } })
        if (!user) {
            return next(new Error("Email not found", { cause: 404 }))
        }
        if (user.confirmEmail) {
            return next(new Error("Email already confirmed", { cause: 409 }))
        }
        if (!compareHash({ plainText: `${code}`, hashValue: user.emailOTP })) {
            return next(new Error("Invalid otp", { cause: 400 }))
        }

        await dbService.updateOne({
            model: userModel,
            filter: { email },
            data: { confirmEmail: true, $unset: { emailOTP: code } }
        })

        return successResponse({ res, message: "Email confirmed", status: 200 })
    }
)
