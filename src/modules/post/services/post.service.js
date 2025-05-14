import { postModel } from "../../../DB/model/Post.model.js";
import { asyncHandler } from "../../../utils/response/error.response.js";
import * as dbService from "../../../DB/db.service.js"
import { cloud } from "../../../utils/multer/cloudinary.js";
import { successResponse } from "../../../utils/response/success.response.js";
import { roleTypes, socketConnections } from "../../../DB/model/User.model.js";
import { commentModel } from "../../../DB/model/Comment.model.js";
import { paginate } from "../../../utils/pagination/pagination.js";
import { getIo } from "../../chat/chat.socket.controller.js";

const populateList = [
    { path: 'userId', select: 'userName image' },
    {
        path: 'comments',
        match: { commentId: { $exists: false } },
        populate: [{
            path: 'replies',
            match: { commentId: { $exists: false } },
            populate: [{
                path: 'replies',
                match: { commentId: { $exists: false } },
            }]
        }]
    },
    { path: 'likes', select: 'userName image' },
    { path: 'shares', select: 'userName image' },
    { path: 'tags', select: 'userName image' },
]

export const createPost = asyncHandler(async (req, res, next) => {
    if (req.files) {
        const attachments = []
        for (const file of req.files) {
            const { secure_url, public_id } = await cloud.uploader.upload(file.path, { folder: "Posts" })
            attachments.push({ secure_url, public_id })
        }
        req.body.attachments = attachments
    }
    const post = await dbService.create({
        model: postModel,
        data: {
            ...req.body,
            userId: req.user._id
        },
    });
    return successResponse({ res, status: 201, message: "Post created successfully", data: { post } });
})

export const getAllPosts = asyncHandler(async (req, res, next) => {

    const { page, size } = req.query
    const data = await paginate({
        model: postModel,
        filter: {
            idDeleted: { $exists: false },
        },
        page,
        size: size,
        populate: populateList
    })
    return successResponse({ res, status: 200, data });

})

export const updatePost = asyncHandler(async (req, res, next) => {
    if (req.files?.length) {
        const attachments = []
        for (const file of req.files) {
            const { secure_url, public_id } = await cloud.uploader.upload(file.path, { folder: "Posts" })
            attachments.push({ secure_url, public_id })
        }
        req.body.attachments = attachments
    }
    const post = await dbService.findOneAndUpdate({
        model: postModel,
        filter: {
            _id: req.params.postId,
            isDeleted: { $exists: false },
            userId: req.user._id
        },
        data: {
            ...req.body,
        },
        options: { new: true }
    });
    return post ?
        successResponse({ res, status: 200, message: "Post updated successfully", data: { post } }) :
        next(new Error("Post doesn't exist", { cause: 404 }))
})

export const freezePost = asyncHandler(async (req, res, next) => {
    const owner = req.user.role === roleTypes.admin ? {} : { userId: req.user._id }
    const post = await dbService.findOneAndUpdate({
        model: postModel,
        filter: {
            _id: req.params.postId,
            isDeleted: { $exists: false },
            ...owner
        },
        data: {
            isDeleted: Date.now(),
            deletedBy: req.user._id
        },
        options: { new: true }
    });
    return post ?
        successResponse({ res, status: 200, message: "Post deleted successfully", data: { post } }) :
        next(new Error("Post doesn't exist", { cause: 404 }))
})

export const restorePost = asyncHandler(async (req, res, next) => {
    const post = await dbService.findOneAndUpdate({
        model: postModel,
        filter: {
            _id: req.params.postId,
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
    });
    return post ?
        successResponse({ res, status: 200, message: "Post restored successfully", data: { post } }) :
        next(new Error("Post doesn't exist", { cause: 404 }))
})

export const likePost = asyncHandler(async (req, res, next) => {
    const { action } = req.query
    const data = action?.toLowerCase() === 'unlike' ? { $pull: { likes: req.user._id } } : { $addToSet: { likes: req.user._id } }
    const post = await dbService.findOneAndUpdate({
        model: postModel,
        filter: {
            _id: req.params.postId,
            isDeleted: { $exists: false },
        },
        data,
        options: { new: true }
    });

    getIo().to(socketConnections.get(post.userId.toString())).emit("likePost", { postId: req.params.postId, likedBy: req.user._id, action })

    return post ?
        successResponse({ res, status: 200, message: "Like", data: { post } }) :
        next(new Error("Post doesn't exist", { cause: 404 }))
})
