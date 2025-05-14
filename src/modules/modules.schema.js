import { GraphQLObjectType, GraphQLSchema } from "graphql";
import * as postQueryResolver from "./post/resolvers/query.resolver.js";
import * as userQueryResolver from "./user/resolvers/user.query.resolver.js";
import * as postMutationResolver from "./post/resolvers/mutation.resolver.js";



export const schema = new GraphQLSchema({
    query: new GraphQLObjectType({
        name: 'Main_Schema_Query',
        description: 'This query contains all the graphQl endpoints in the project',
        fields: {
            ...postQueryResolver,
            ...userQueryResolver,
        }
    }),

    mutation: new GraphQLObjectType({
        name: 'Main_Schema_Mutation',
        description: 'This mutation contains all the graphQl endpoints in the project',
        fields: {
            ...postMutationResolver,
        }
    }),
})