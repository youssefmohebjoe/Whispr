import { GraphQLNonNull, GraphQLString } from "graphql"
import { userProfileResponse } from "../types/user.types.js"
import { authentication } from "../../../middlewares/auth.graph.middleware.js"


export const profile = {
    type: userProfileResponse,
    args: {
        token: { type: new GraphQLNonNull(GraphQLString) }
    },
    resolve: async (parent, args) => {
        const user = await authentication({ authorization: args.token })
        return { statusCode: 200, message: "Done", data: user }
    }
}