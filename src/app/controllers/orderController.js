const orderService = require('../services/orderService');
const {handler} = require('./errHandler');

/**
 * @param  {Object} req
 * @param  {Object} res
 * @param  {Object} next
 */
async function index(req, res, next) {
    const page = req.query.page || 0;
    const limit = req.query.limit || 1000;
    const query = req.query;
    orderService.getAll(query, page, limit)
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
    orderService.insert(req.body)
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
