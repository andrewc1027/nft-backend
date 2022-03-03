const userModel = require("../../models/user");
const {DocumentNotFoundError} = require('mongoose').Error;
const {ObjectId} = require("mongodb");


async function getAllUsers() {
    const users = await userModel.find({});
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
