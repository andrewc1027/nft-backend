const userModel = require("../../models/user");
const {DocumentNotFoundError} = require('mongoose').Error;
const {ObjectId} = require("mongodb");
const qTransform = require("../../utils/queryTransform");


async function getAllUsers(query) {
    const filters = {};
    const ors = [];
    if (query.search) {
        const q = query.search;
        ors.push({'username': qTransform.regexLike(q)});
        ors.push({'email': qTransform.regexLike(q)});
        ors.push({'bio': qTransform.regexLike(q)});
        ors.push({'walletAddress': qTransform.regexLike(q)});
    }
    if (ors.length > 0) {
        filters['$or'] = ors;
    }
    const users = await userModel.find(filters);
    return users;
}

async function getUserById(id) {
    return userModel.findById(id).orFail(
        () => new DocumentNotFoundError('User not Found'));
}

async function updateUser(id, updateQuery) {
    await userModel.findByIdAndUpdate(id, updateQuery).orFail(
        () => new DocumentNotFoundError('User not found or wrong request'));
    return userModel.findById(id)
}

module.exports = {
    getAllUsers,
    getUserById,
    updateUser
};
