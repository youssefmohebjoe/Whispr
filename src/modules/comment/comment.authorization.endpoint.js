import { roleTypes } from "../../DB/model/User.model.js";

export const endPoint = {
    create: [roleTypes.user],
    like: [roleTypes.user, roleTypes.admin],
    freeze: [roleTypes.user, roleTypes.admin],
}