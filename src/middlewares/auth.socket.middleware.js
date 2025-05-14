import { tokenTypes, verifyToken } from "../utils/security/token.security.js"
import * as dbService from '../DB/db.service.js'
import { userModel } from "../DB/model/User.model.js"


export const authenticationSocket = async ({ socket = {}, tokenType = tokenTypes.access } = {}) => {
    const [bearer, token] = socket.handshake?.auth?.authorization?.split(" ") || []
    if (!bearer || !token) {
        return { data: { message: "Account is not authorized", status: 400 } }
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
        return { data: { message: "Invalid token payload", status: 401 } }
    }
    const user = await dbService.findOne({
        model: userModel,
        filter: { _id: decoded.id, isDeleted: { $exists: false } }
    })
    if (!user) {
        return { data: { message: "Invalid token account", status: 401 } }
    }
    if (user.changeCredentialsTime?.getTime() >= decoded.iat * 1000) {
        return { data: { message: "Invalid credentials", status: 400 } }
    }
    return { data: { user, valid: true } }
}

export const authorization = async ({ accessRoles = [], role } = {}) => {
    if (!accessRoles.includes(role)) {
        throw new Error('Not authorized account')
    }
    return true
}