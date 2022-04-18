const trxService = require('../../services/admin/trxService');
const {handler} = require('../errHandler');

async function getTransactions(req, res, next) {
    const page = req.query.page || 1;
    const size = req.query.size || 10;
    const sort = req.query.sort || "date:desc";
    try {
        const trxs = await trxService.getTransactions(req.query, page, size, sort);
        return res.json(trxs);
    } catch (error) {
        handler(error, res);
    }
}

module.exports = {
    getTransactions,
}