const userModel = require("../../models/user");
const {DocumentNotFoundError} = require('mongoose').Error;
const {ObjectId} = require("mongodb");
const qTransform = require("../../utils/queryTransform");


async function getAllUsers(query) {
    const queries = {};
    if (query.username) {
        queries['username'] = qTransform.regexLike(query.username);
    }

    if (query.email) {
        queries['email'] = qTransform.regexLike(query.email);
    }

    if (query.invited === "true") {
        queries['invited'] = true;
    } else if (query.invited === "false") {
        queries['invited'] = false;
    }

    const users = await userModel.find(queries);
    return users;
}

async function getUserById(id) {
    return userModel.findById(id).orFail(
        () => new DocumentNotFoundError('User not Found'));
}

async function updateUser(id, updateQuery) {
    return userModel.findByIdAndUpdate(id, updateQuery).orFail(
        () => new DocumentNotFoundError('User not found or wrong request'));
}

module.exports = {
    getAllUsers,
    getUserById,
    updateUser
};
