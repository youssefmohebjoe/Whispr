export const create = async ({ model, data = {} } = {}) => {
    const document = await model.create(data)
    return document
}

//Finder:
export const findAll = async ({ model, filter = {}, select = "", populate = [], skip = 0, limit = 1000 } = {}) => {
    const documents = await model.find(filter).select(select).populate(populate).skip(skip).limit(limit)
    return documents
}
export const findOne = async ({ model, filter = {}, select = "", populate = [] } = {}) => {
    const document = await model.findOne(filter).select(select).populate(populate)
    return document
}

//Update:
export const findOneAndUpdate = async ({ model, filter = {}, data = {}, options = {}, select = "", populate = [] } = {}) => {
    const document = await model.findOneAndUpdate(filter, data, options).select(select).populate(populate)
    return document
}
export const findByIdAndUpdate = async ({ model, id = "", data = {}, options = {}, select = "", populate = [] } = {}) => {
    const document = await model.findByIdAndUpdate(id, data, options).select(select).populate(populate)
    return document
}
export const updateOne = async ({ model, filter = {}, data = {}, options = {} } = {}) => {
    const document = await model.updateOne(filter, data, options)
    return document
}
export const updateMany = async ({ model, filter = {}, data = {}, options = {} } = {}) => {
    const documents = await model.updateMany(filter, data, options)
    return documents
}

//Delete:
export const findOneAndDelete = async ({ model, filter = {}, select = "", populate = [] } = {}) => {
    const document = await model.findOneAndDelete(filter).select(select).populate(populate)
    return document
}
export const findByIdAndDelete = async ({ model, id = "", select = "", populate = [] } = {}) => {
    const document = await model.findByIdAndDelete(id).select(select).populate(populate)
    return document
}
export const deleteOne = async ({ model, filter = {} } = {}) => {
    const document = await model.deleteOne(filter)
    return document
}
export const deleteMany = async ({ model, filter = {} } = {}) => {
    const documents = await model.deleteMany(filter)
    return documents
}