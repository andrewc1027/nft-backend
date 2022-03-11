const customNftService = require('../services/orderService');
const http = require('https');
const {handler} = require('./errHandler');

/**
 * @param  {Object} req
 * @param  {Object} res
 * @param  {Object} next
 */
async function index(req, res, next) {
    const page = req.query.page || 0;
    const limit = req.query.limit || 10;
    const query = req.query;
    const user = req.user;
    customNftService.getAll(query, page, limit, user)
        .then(function (data) {
            return res.json(data);
        })
        .catch((err) => {
            handler(err, res);
        });
}

/**
 * @param  {Object} req
 * @param  {Object} res
 * @param  {Object} next
 */
async function insert(req, res, next) {
    customNftService.insert(req.body, req.user)
        .then(function (data) {
            return res.json(data);
        })
        .catch((err)=>{
            console.log(err);
            handler(err, res);
        });
}

module.exports = {
    index,
    insert
};
