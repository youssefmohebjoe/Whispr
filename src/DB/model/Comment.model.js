import mongoose, { Schema, Types, model } from "mongoose"


const commentSchema = new Schema({

    content: {
        type: String,
        required: function () {
            return this?.attachments?.length ? false : true;
        },
        minlength: 2,
        maxlength: 20000,
        trim: true
    },

    attachments: [{ secure_url: String, public_id: String }],
    userId: { type: Types.ObjectId, ref: 'User', required: true },
    postId: { type: Types.ObjectId, ref: 'Post', required: true },
    commentId: { type: Types.ObjectId, ref: 'Comment' },
    likes: [{ type: Types.ObjectId, ref: 'User' }],
    tags: [{ type: Types.ObjectId, ref: 'User' }],
    createdBy: [{ type: Types.ObjectId, ref: 'User' }],
    deletedBy: [{ type: Types.ObjectId, ref: 'User' }],
    isDeleted: Date,
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
})

commentSchema.virtual("replies", {
    localField: "_id",
    foreignField: "commentId",
    ref: "Comment",
    justOne: true
})

export const commentModel = mongoose.models.comment || model("Comment", commentSchema)