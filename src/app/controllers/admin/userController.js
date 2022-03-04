const usrService = require('../../services/admin/userService');
const {handler} = require('./../errHandler');

async function getAllUsers(req, res, next) {
    usrService.getAllUsers(req.query)
        .then(function (users) {
        return res.json(users);
    })
}

async function getUserById(req, res, next) {
    usrService.getUserById(req.params.id)
        .then(function (user) {
            return res.json(user);
        })
        .catch((err) => {
            handler(err, res);
        });
}

async function updateUser(req, res, next) {
    usrService.updateUser(req.params.id, req.body)
        .then(function (user) {
            return res.json(user);
        })
        .catch((err) => {
            handler(err, res);
        });
}

module.exports = {
    getAllUsers,
    getUserById,
    updateUser
};

