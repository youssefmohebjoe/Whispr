import { GraphQLID, GraphQLInt, GraphQLList, GraphQLObjectType, GraphQLString } from 'graphql'
import { imageType, userType } from '../../user/types/user.types.js'
import * as dbService from '../../../DB/db.service.js'
import { userModel } from '../../../DB/model/User.model.js'


export const postType = new GraphQLObjectType({
    name: 'postType',
    fields: {
        _id: { type: GraphQLID },
        content: { type: GraphQLString },
        attachments: {
            type: new GraphQLList(imageType)
        },
        likes: { type: new GraphQLList(GraphQLID) },
        tags: { type: new GraphQLList(GraphQLID) },
        share: { type: new GraphQLList(GraphQLID) },
        userId: { type: GraphQLID },
        userIdInfo: {
            type: userType,
            resolve: async (parent, args) => {
                return await dbService.findOne({
                    model: userModel,
                    filter: {
                        _id: parent.userId
                    }
                })
            }
        },
        deletedBy: { type: GraphQLID },
        isDeleted: { type: GraphQLString },
        createdAt: { type: GraphQLString },
        updatedAt: { type: GraphQLString },
    }
})

export const postList = new GraphQLList(postType)

export const postListResponse = new GraphQLObjectType({
    name: 'postListResponse',
    fields: {
        statusCode: { type: GraphQLInt },
        message: { type: GraphQLString },
        data: { type: postList }
    }
})

export const likePostResponse = new GraphQLObjectType({
    name: 'likePostResponse',
    fields: {
        statusCode: { type: GraphQLInt },
        message: { type: GraphQLString },
        data: { type: postType }
    }
})