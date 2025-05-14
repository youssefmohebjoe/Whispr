import { asyncHandler } from "../utils/response/error.response.js"
import { tokenTypes, verifyToken } from "../utils/security/token.security.js"
import * as dbService from '../DB/db.service.js'
import { userModel } from "../DB/model/User.model.js"


export const authentication = async ({ authorization, tokenType = tokenTypes.access } = {}) => {
    const [bearer, token] = authorization?.split(" ") || []
    if (!bearer || !token) {
        throw new Error('Account is not authorized')
    }
    let accessSignature = "";
    let refreshSignature = "";
    switch (bearer) {
        case 'System':
            accessSignature = process.env.SYSTEM_ACCESS_TOKEN
            refreshSignature = process.env.SYSTEM_REFRESH_TOKEN
            break;
        case 'Bearer':
            accessSignature = process.env.USER_ACCESS_TOKEN
            refreshSignature = process.env.USER_REFRESH_TOKEN
            break;
        default:
            break;
    }
    const decoded = verifyToken({
        token,
        signature: tokenType == tokenTypes.access ?
            accessSignature :
            refreshSignature
    })
    if (!decoded?.id) {
        throw new Error('Invalid token payload')
    }
    const user = await dbService.findOne({
        model: userModel,
        filter: { _id: decoded.id, isDeleted: false }
    })
    if (!user) {
        throw new Error('Invalid token account')
    }
    if (user.changeCredentialsTime?.getTime() >= decoded.iat * 1000) {
        throw new Error('Invalid credentials')
    }
    return user
}

export const authorization = async ({ accessRoles = [], role } = {}) => {
    if (!accessRoles.includes(role)) {
        throw new Error('Not authorized account')
    }
    return true
}