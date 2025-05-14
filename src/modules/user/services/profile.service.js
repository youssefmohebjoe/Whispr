import * as dbService from "../../../DB/db.service.js"
import { asyncHandler } from "../../../utils/response/error.response.js";
import { successResponse } from "../../../utils/response/success.response.js";
import { compareHash, generateHash } from "../../../utils/security/hash.security.js";
import { emailEvent } from "../../../utils/events/email.event.js";
import { cloud } from "../../../utils/multer/cloudinary.js";
import { postModel } from "../../../DB/model/Post.model.js";
import { roleTypes, userModel } from "../../../DB/model/User.model.js";


export const profile = asyncHandler(async (req, res, next) => {
    const user = await dbService.findOne({
        model: userModel,
        filter: { _id: req.user._id },
        populate: [
            {path:"friends",select:"userName image"},
            { path: "viewers.userId", select: 'userName image' }]
    })
    return successResponse({ res, data: { user } })
})

export const viewProfile = asyncHandler(async (req, res, next) => {
    const { profileId } = req.params;
    const user = await dbService.findOne({
        model: userModel,
        filter: {
            _id: profileId,
            isDeleted: false
        },
        select: "userName email DOB phone image"
    })
    if (!user) {
        return next(new Error("Invalid account Id", { cause: 404 }))
    }
    if (profileId != req.user._id.toString()) {
        await dbService.updateOne({
            model: userModel,
            filter: { _id: profileId },
            data: {
                $push: { viewers: { userId: req.user._id, viewedTime: Date.now() } }
            }
        })
    }

    return successResponse({ res, data: { user } })
})

export const updateSimpleInfo = asyncHandler(async (req, res, next) => {
    const user = await dbService.findByIdAndUpdate({
        model: userModel,
        id: req.user._id,
        data: req.body,
        options: { new: true }
    })
    return successResponse({ res, data: { user } })
})

export const updatePassword = asyncHandler(async (req, res, next) => {
    const { oldPassword, password } = req.body
    if (!compareHash({ plainText: oldPassword, hashValue: req.user.password })) {
        return next(new Error("Invalid old password", { cause: 400 }))
    }

    const user = await dbService.findByIdAndUpdate({
        model: userModel,
        id: req.user._id,
        data: {
            password: generateHash({ plainText: password }),
            changeCredentialsTime: Date.now()
        },
        options: { new: true }
    })
    return successResponse({ res, data: {} })
})

export const updateEmail = asyncHandler(async (req, res, next) => {
    const { email } = req.body
    if (await dbService.findOne({
        model: userModel,
        filter: { email }
    })) {
        return next(new Error("Email already exists", { cause: 409 }))
    }
    await dbService.updateOne({
        model: userModel,
        filter: { _id: req.user._id },
        data: { tempEmail: email }
    })
    emailEvent.emit('updateEmail', { id: req.user._id, email }) // New account OTP 
    emailEvent.emit('sendConfirmEmail', { id: req.user._id, email: req.user.email }) // Old account OTP
    return successResponse({ res, data: {} })
})

export const replaceEmail = asyncHandler(async (req, res, next) => {
    const { oldEmailOTP, newEmailOTP } = req.body
    if (await dbService.findOne({
        model: userModel,
        filter: { email: req.user.tempEmail }
    })) {
        return next(new Error("Email already exists", { cause: 409 }))
    }
    if (!compareHash({ plainText: oldEmailOTP, hashValue: req.user.emailOTP })) {
        return next(new Error("You must provide a verification code from your old email", { cause: 400 }))
    }

    if (!compareHash({ plainText: newEmailOTP, hashValue: req.user.updateEmailOTP })) {
        return next(new Error("You must provide a verification code from your new email", { cause: 400 }))
    }

    await dbService.updateOne({
        model: userModel,
        filter: { _id: req.user._id },
        data: {
            email: req.user.tempEmail,
            changeCredentialsTime: Date.now(),
            $unset: {
                tempEmail: 0,
                emailOTP: 0,
                updateEmailOTP: 0,
            }
        }
    })

    return successResponse({ res, data: {} })
})

export const addFriend = asyncHandler(async (req, res, next) => {
    const { friendId } = req.params;
    const friend = await dbService.findOneAndUpdate({
        model: userModel,
        filter: {
            _id: friendId,
            isDeleted: { $exists: false },
        },
        data: {
            $addToSet: {
                friends: req.user._id
            }
        },
        options: { new: true }
    })

    if (!friend) {
        return next(new Error('Invalid account ID ', { cause: 404 }))
    }

    const user = await dbService.findByIdAndUpdate({
        model: userModel,
        id: req.user._id,
        data: {
            $addToSet: { friends: friendId }
        },
        options: { new: false }
    })

    return successResponse({ res })
})

export const updateImage = asyncHandler(async (req, res, next) => {
    const { secure_url, public_id } = await cloud.uploader.upload(req.file.path, { folder: `user profile/${req.user._id}` })
    const user = await dbService.findByIdAndUpdate({
        model: userModel,
        id: req.user._id,
        data: {
            image: { secure_url, public_id }
        },
        options: { new: false }
    })
    if (user.image?.public_id) {
        await cloud.uploader.destroy(user.image.public_id)
    }

    return successResponse({ res, data: { file: req.file } })
})

export const coverImages = asyncHandler(async (req, res, next) => {
    console.log(req.files);
    const images = []
    for (const file of req.files) {
        const { secure_url, public_id } = await cloud.uploader.upload(file.path, { folder: `user images/${req.user._id}/cover` })
        images.push({ secure_url, public_id })
    }
    const user = await dbService.findByIdAndUpdate({
        model: userModel,
        id: req.user._id,
        data: {
            coverImages: images
        },
        options: { new: true }
    })

    return successResponse({ res, data: { files: req.files, user } })
})

export const dashBoard = asyncHandler(async (req, res, next) => {

    const data = await Promise.allSettled([
        dbService.findAll({
            model: userModel,
            filter: {}
        }),
        dbService.findAll({
            model: postModel,
            filter: {}
        })
    ])

    return successResponse({ res, data: { data } })
})

export const changePrivileges = asyncHandler(async (req, res, next) => {

    const { userId, role } = req.body
    const owner = req.user.role === roleTypes.superAdmin ? {} : {
        role: { $nin: [roleTypes.admin, roleTypes.superAdmin] }
    }
    const user = await dbService.findOneAndUpdate({
        model: userModel,
        filter: {
            _id: userId,
            isDeleted: { $exists: false },
            ...owner
        },
        data: {
            role,
            modifiedBy: req.user._id
        },
        options: { new: true }
    })

    return successResponse({ res, data: { user } })
})