import mongoose, { Schema, Types, model } from "mongoose"


const postSchema = new Schema({

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
    // comments: [{ type: Types.ObjectId, ref: 'Comment' }],
    likes: [{ type: Types.ObjectId, ref: 'User' }],
    tags: [{ type: Types.ObjectId, ref: 'User' }],
    shares: [{ type: Types.ObjectId, ref: 'User' }],
    createdBy: { type: Types.ObjectId, ref: 'User' },
    deletedBy: { type: Types.ObjectId, ref: 'User' },
    isDeleted: Date,


}, {
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
})

postSchema.virtual('comments', {
    ref: 'Comment',
    localField: '_id',
    foreignField: 'postId',
    justOne: true
})


export const postModel = mongoose.models.post || model("Post", postSchema)