import { roleTypes } from "../../DB/model/User.model.js";

export const endPoint = {
    createPost: [roleTypes.user],
    likePost: [roleTypes.user, roleTypes.admin],
    freezePost: [roleTypes.user, roleTypes.admin],
}