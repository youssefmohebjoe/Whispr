import mongoose, { Schema, Types, model } from "mongoose"

export const genderTypes = { male: 'male', female: 'female' }
export const roleTypes = { user: 'user', admin: 'admin', superAdmin: "superAdmin" }
export const providerTypes = { system: 'system', google: 'google' }


const userSchema = new Schema({

    userName: {
        type: String,
        required: true,
        minlength: 2,
        maxlength: 25,
        trim: true
    },

    email: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },

    emailOTP: String,

    tempEmail: String,

    updateEmailOTP: String,

    password: {
        type: String,
        trim: true
    },

    forgetPasswordOTP: String,

    phone: String,

    DOB: Date,

    image: {
        secure_url: String,
        public_id: String
    },
    coverImages: [{
        secure_url: String,
        public_id: String
    }],

    gender: {
        type: String,
        enum: Object.values(genderTypes),
        default: genderTypes.male
    },

    role: {
        type: String,
        enum: Object.values(roleTypes),
        default: roleTypes.user
    },

    provider: {
        type: String,
        enum: Object.values(providerTypes),
        default: providerTypes.system
    },

    confirmEmail: {
        type: Boolean,
        default: false
    },

    isDeleted: {
        type: Boolean,  
    },

    modifiedBy: {
        type: Types.ObjectId,
        ref: 'User'
    },

    changeCredentialsTime: Date,

    viewers: [{
        userId:
        {
            type: Types.ObjectId,
            ref: 'User'
        },
        viewedTime: [Date]
    }],

    friends: [{ type: Types.ObjectId, ref: 'User' }],

}, {
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
})

export const userModel = mongoose.models.user || model("User", userSchema)
export const socketConnections = new Map()
