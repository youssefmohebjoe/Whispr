import { GraphQLBoolean, GraphQLEnumType, GraphQLID, GraphQLInputObjectType, GraphQLInt, GraphQLList, GraphQLObjectType, GraphQLString } from "graphql";
import { genderTypes, providerTypes, roleTypes } from "../../../DB/model/User.model.js";


export const imageType = new GraphQLObjectType({
    name: 'attachmentType',
    fields: {
        secure_url: { type: GraphQLString },
        public_id: { type: GraphQLString }
    }
})

export const userType = new GraphQLObjectType({
    name: 'userType',
    fields: {
        _id: { type: GraphQLID },
        firstName: { type: GraphQLString },
        lastName: { type: GraphQLString },
        userName: { type: GraphQLString },
        email: { type: GraphQLString },
        password: { type: GraphQLString },
        emailOTP: { type: GraphQLString },
        tempEmail: { type: GraphQLString },
        updateEmailOTP: { type: GraphQLString },
        forgetPasswordOTP: { type: GraphQLString },
        phone: { type: GraphQLString },
        DOB: { type: GraphQLString },
        gender: {
            type: new GraphQLEnumType({
                name: 'genderType',
                values: {
                    male: { value: genderTypes.male },
                    female: { value: genderTypes.female },
                }
            })
        },
        role: {
            type: new GraphQLEnumType({
                name: 'roleType',
                values: {
                    superAdmin: { value: roleTypes.superAdmin },
                    admin: { value: roleTypes.admin },
                    user: { value: roleTypes.user }
                }
            })
        },
        provider: {
            type: new GraphQLEnumType({
                name: 'providerType',
                values: {
                    system: { value: providerTypes.system },
                    google: { value: providerTypes.google },
                }
            })
        },
        confirmEmail: { type: GraphQLBoolean },
        isDeleted: { type: GraphQLBoolean },
        changeCredentialsTime: { type: GraphQLString },
        image: { type: imageType },
        coverImages: { type: new GraphQLList(imageType) },
    }
})

export const userList = new GraphQLList(userType)

export const userProfileResponse = new GraphQLObjectType({
    name: 'ProfileResponse',
    fields: {
        statusCode: { type: GraphQLInt },
        message: { type: GraphQLString },
        data: { type: userType },
    }
})