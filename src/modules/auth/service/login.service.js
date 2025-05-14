import { providerTypes, roleTypes, userModel } from "../../../DB/model/User.model.js"
import { emailEvent } from "../../../utils/events/email.event.js"
import { asyncHandler } from "../../../utils/response/error.response.js"
import { successResponse } from "../../../utils/response/success.response.js"
import { compareHash, generateHash } from "../../../utils/security/hash.security.js"
import { decodeToken, generateToken, tokenTypes, verifyToken } from "../../../utils/security/token.security.js"
import { OAuth2Client } from 'google-auth-library';
import * as dbService from "../../../DB/db.service.js"

export const login = asyncHandler(
    async (req, res, next) => {
        const { email, password } = req.body
        const user = await dbService.findOne({ model: userModel, filter: { email } })
        if (!user) {
            return next(new Error("Account not found", { cause: 404 }))
        }
        if (!user.confirmEmail) {
            return next(new Error("Please verify your account first", { cause: 400 }))
        }
        if (user.provider != providerTypes.system) {
            return next(new Error("Invalid provider", { cause: 400 }))
        }
        if (!compareHash({ plainText: password, hashValue: user.password })) {
            return next(new Error("Account not found", { cause: 404 }))
        }

        const accessToken = generateToken(
            {
                payload: { id: user._id },
                signature: user.role === roleTypes.admin ?
                    process.env.SYSTEM_ACCESS_TOKEN :
                    process.env.USER_ACCESS_TOKEN
            })
        const refreshToken = generateToken(
            {
                payload: { id: user._id },
                signature: user.role === roleTypes.admin ?
                    process.env.SYSTEM_REFRESH_TOKEN :
                    process.env.USER_REFRESH_TOKEN,
                expiresIn: parseInt(process.env.REFRESH_TOKEN_EXPIRY)
            })

        return successResponse({
            res,
            message: "Logged in",
            status: 200,
            data: {
                accessToken, refreshToken
            }
        })
    }
)

export const googleLogin = asyncHandler(

    async (req, res, next) => {
        const { idToken } = req.body;
        const client = new OAuth2Client();
        async function verify() {
            const ticket = await client.verifyIdToken({
                idToken,
                audience: process.env.WEB_CLIENT_ID,  // Specify the WEB_CLIENT_ID of the app that accesses the backend
                // Or, if multiple clients access the backend:
                //[WEB_CLIENT_ID_1, WEB_CLIENT_ID_2, WEB_CLIENT_ID_3]
            });
            const payload = ticket.getPayload();
            return payload
        }

        const gmailData = await verify()
        console.log(gmailData);

        const { email_verified, email, name, picture } = gmailData

        if (!email_verified) {
            return next(new Error("Account is not verified", { cause: 406 }))
        }
        let user = await dbService.findOne({ model: userModel, filter: { email } })
        if (user?.provider === providerTypes.system) {
            return next(new Error("Invalid login provider", { cause: 409 }))
        }
        if (!user) {
            user = await dbService.create({
                model: userModel,
                data: {
                    confirmEmail: email_verified,
                    email,
                    userName: name,
                    image: picture,
                    provider: providerTypes.google
                }
            })
        }

        const accessToken = generateToken(
            {
                payload: { id: user._id },
                signature: user.role === roleTypes.admin ?
                    process.env.SYSTEM_ACCESS_TOKEN :
                    process.env.USER_ACCESS_TOKEN
            })
        const refreshToken = generateToken(
            {
                payload: { id: user._id },
                signature: user.role === roleTypes.admin ?
                    process.env.SYSTEM_REFRESH_TOKEN :
                    process.env.USER_REFRESH_TOKEN,
                expiresIn: parseInt(process.env.REFRESH_TOKEN_EXPIRY)
            })

        return successResponse({
            res,
            message: "Logged in",
            status: 200,
            data: { accessToken, refreshToken }
        })
    }
)

export const refreshToken = asyncHandler(async (req, res, next) => {
    const user = await decodeToken({ authorization: req.headers.authorization, tokenType: tokenTypes.refresh, next })
    const accessToken = generateToken(
        {
            payload: { id: user._id },
            signature: user.role === roleTypes.admin ?
                process.env.SYSTEM_ACCESS_TOKEN :
                process.env.USER_ACCESS_TOKEN
        })
    const refreshToken = generateToken(
        {
            payload: { id: user._id },
            signature: user.role === roleTypes.admin ?
                process.env.SYSTEM_REFRESH_TOKEN :
                process.env.USER_REFRESH_TOKEN,
            expiresIn: parseInt(process.env.REFRESH_TOKEN_EXPIRY)
        })
    return successResponse({
        res,
        message: "Logged in",
        status: 200,
        data: { accessToken, refreshToken }
    })
})

export const forgetPassword = asyncHandler(async (req, res, next) => {
    const { email } = req.body
    const user = await dbService.findOne({
        model: userModel,
        filter: { email, isDeleted: false }
    })
    if (!user) {
        return next(new Error("Invalid account", { cause: 404 }))
    }
    emailEvent.emit("sendForgetPassword", { id: user._id, email })
    return successResponse({ res })
})

export const resetPassword = asyncHandler(async (req, res, next) => {
    const { email, code, password } = req.body
    const user = await dbService.findOne({
        model: userModel,
        filter: { email, isDeleted: false }
    })
    if (!user) {
        return next(new Error("Invalid account", { cause: 404 }))
    }

    if (!compareHash({ plainText: code, hashValue: user.forgetPasswordOTP })) {
        return next(new Error("Invalid otp", { cause: 400 }))
    }
    const hashPassword = generateHash({ plainText: password })
    await dbService.updateOne({
        model: userModel,
        filter: { email },
        data: {
            password: hashPassword,
            confirmEmail: true,
            changeCredentialsTime: Date.now(),
            $unset: { forgetPasswordOTP: code, emailOTP: code }
        }
    })

    return successResponse({ res, message: "Password updated successfully" })
})