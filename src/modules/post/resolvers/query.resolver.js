import { postModel } from '../../../DB/model/Post.model.js'
import * as dbService from '../../../DB/db.service.js'
import * as postTypes from '../types/post.types.js'


export const getPostList = {
    type: postTypes.postListResponse,
    resolve: async (parent, args) => {
        const posts = await dbService.findAll({
            model: postModel,
        })
        return { message: "Done", statusCode: 200, data: posts }
    }
}
