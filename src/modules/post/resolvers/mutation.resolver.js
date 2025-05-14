import { postModel } from '../../../DB/model/Post.model.js'
import * as dbService from '../../../DB/db.service.js'
import * as postTypes from '../types/post.types.js'
import { GraphQLEnumType, GraphQLID, GraphQLNonNull, GraphQLString } from 'graphql'
import { authentication, authorization } from '../../../middlewares/auth.graph.middleware.js'
import { roleTypes } from '../../../DB/model/User.model.js'
import { graphLikePost } from '../post.validation.js'
import { graphValidation } from '../../../middlewares/validation.middleware.js'


export const likePost = {
    type: postTypes.likePostResponse,
    args: {
        postId: { type: new GraphQLNonNull(GraphQLID) },
        token: { type: new GraphQLNonNull(GraphQLString) },
        action: {
            type: new GraphQLNonNull(new GraphQLEnumType({
                name: 'likeActionType',
                values: {
                    like: { value: 'like' },
                    unLike: { value: 'unLike' },
                }
            }))
        },
    },
    resolve: async (parent, args) => {
        const { postId, token, action } = args
        graphValidation({ schema: graphLikePost, args })
        // authentication
        const user = await authentication({ authorization: token })
        await authorization({ role: user.role, accessRoles: [roleTypes.user] })
        const data = action === 'unLike' ? { $pull: { likes: user._id } } : { $addToSet: { likes: user._id } }
        const post = await dbService.findOneAndUpdate({
            model: postModel,
            filter: {
                _id: postId,
                isDeleted: { $exists: false },
            },
            data,
            options: { new: true }
        });
        return { message: 'Done', statusCode: 200, data: { post } }
    }
}