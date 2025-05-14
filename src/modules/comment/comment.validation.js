import Joi from "joi";
import { generalFields } from "../../middlewares/validation.middleware.js";

export const createComment = Joi.object().keys({
    postId: generalFields.id.required(),
    commentId: generalFields.id,
    content: Joi.string().min(2).max(20000).trim(),
    file: Joi.array().items(generalFields.file).max(2),
}).or('content', 'file')

export const updateComment = Joi.object().keys({
    postId: generalFields.id.required(),
    commentId: generalFields.id.required(),
    content: Joi.string().min(2).max(20000).trim(),
    file: Joi.array().items(generalFields.file).max(2),
}).or('content', 'file')

export const freezeComment = Joi.object().keys({
    postId: generalFields.id.required(),
    commentId: generalFields.id.required(),
}).required()

export const likeComment = Joi.object().keys({
    postId: generalFields.id.required(),
    action: Joi.string().valid('like', 'unlike').default('like')
}).required()