import * as dbService from "../../DB/db.service.js"

export const paginate = async ({
    page = process.env.PAGE,
    size = process.env.SIZE,
    model,
    filter = {},
    populate = [],
    select = ""

} = {}) => {

    page = parseInt(parseInt(page) < 1 ? process.env.PAGE : page);
    size = parseInt(parseInt(size) < 1 ? process.env.SIZE : size);
    const skip = (page - 1) * size;
    const count = await model.find(filter).countDocuments()
    const result = await dbService.findAll({
        model,
        filter,
        populate,
        skip,
        select,
        limit: size
    });
    return { page, size, count, result }
}