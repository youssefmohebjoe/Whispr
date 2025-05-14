import { asyncHandler } from "../../../utils/response/error.response.js";
import { successResponse } from "../../../utils/response/success.response.js";
import * as dbService from "../../../DB/db.service.js";
import { postModel } from "../../../DB/model/Post.model.js";
import { cloud } from "../../../utils/multer/cloudinary.js";
import { commentModel } from "../../../DB/model/Comment.model.js";
import { roleTypes } from "../../../DB/model/User.model.js";


export const createComment = asyncHandler(async (req, res, next) => {
    const { postId, commentId } = req.params;
    if (commentId) {
        const checkComment = await dbService.findOne({
            model: commentModel,
            filter: {
                _id: commentId,
                postId: postId,
                idDeleted: { $exists: false }
            }
        })
        if (!checkComment) {
            return next(new Error("Something went wrong", { cause: 404 }))
        }
        req.body.commentId = commentId
    }

    const post = await dbService.findOne({
        model: postModel,
        filter: { _id: postId, isDeleted: { $exists: false } },
    })
    if (!post) {
        return next(new Error("Post doesn't exist", { cause: 404 }))
    }
    if (req.files?.length) {
        const attachments = []
        for (const file of req.files) {
            const { secure_url, public_id } = await cloud.uploader.upload(file.path,
                { folder: `${process.env.APP_NAME}/user/${post.userId}/post/comment` })
            attachments.push({ secure_url, public_id })
        }
        req.body.attachments = attachments
    }
    const comment = await dbService.create({
        model: commentModel,
        data: {
            ...req.body,
            postId,
            userId: req.user._id
        }
    });

    return successResponse({ res, status: 201, message: "Comment created successfully", data: { comment } })
})

export const updateComment = asyncHandler(async (req, res, next) => {

    const { postId, commentId } = req.params
    const comment = await dbService.findOne({
        model: commentModel,
        filter: {
            _id: commentId,
            postId,
            isDeleted: { $exists: false }
        },
        populate: [
            {
                path: 'postId',
            }
        ],
    })

    if (!comment || comment.postId.isDeleted) {
        return next(new Error("Comment doesn't exist", { cause: 404 }))
    }

    if (req.files?.length) {
        const attachments = []
        for (const file of req.files) {
            const { secure_url, public_id } = await cloud.uploader.upload(file.path,
                { folder: `${process.env.APP_NAME}/user/${comment.postId.userId}/post/comment` })
            attachments.push({ secure_url, public_id })
        }
        req.body.attachments = attachments
    }
    const updatedComment = await dbService.findOneAndUpdate({
        model: commentModel,
        filter: {
            _id: commentId,
            postId,
            isDeleted: { $exists: false }
        },
        data: req.body,
        options: { new: true }
    });


    return successResponse({ res, status: 200, message: "Comment updated successfully", data: { comment: updatedComment } })
})

export const freezeComment = asyncHandler(async (req, res, next) => {

    const { postId, commentId } = req.params
    const comment = await dbService.findOne({
        model: commentModel,
        filter: {
            _id: commentId,
            postId,
            isDeleted: { $exists: false }
        },
        populate: [
            {
                path: 'postId',
            }
        ],
    })

    if (
        !comment
        ||
        (req.user.role != roleTypes.admin
            &&
            req.user._id.toString() != commentId
            &&
            req.user._id.toString() != comment.postId.userId.toString())
    ) {
        return next(new Error("Sorry , you can't update this field", { cause: 404 }))
    }

    const updatedComment = await dbService.findOneAndUpdate({
        model: commentModel,
        filter: {
            _id: commentId,
            postId,
            isDeleted: { $exists: false }
        },
        data: {
            isDeleted: Date.now(),
            deletedBy: req.user._id
        },
        options: { new: true }
    })

    return successResponse({ res, status: 200, message: "Comment deleted successfully", data: { comment: updatedComment } })

})

export const restoreComment = asyncHandler(async (req, res, next) => {

    const { postId, commentId } = req.params

    const updatedComment = await dbService.findOneAndUpdate({
        model: commentModel,
        filter: {
            _id: commentId,
            postId,
            isDeleted: { $exists: true },
            deletedBy: req.user._id
        },
        data: {
            $unset: {
                isDeleted: 0,
                deletedBy: 0
            }
        },
        options: { new: true }
    })

    return successResponse({ res, status: 200, message: "Comment restored successfully", data: { comment: updatedComment } })

})