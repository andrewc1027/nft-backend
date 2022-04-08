const trxService = require('../../services/admin/trxService');
const {handler} = require('../errHandler');
const http = require("https");

async function getTransactions(req, res, next) {
    const page = req.query.page || 1;
    const size = req.query.size || 10;
    try {
        const trxs = await trxService.getTransactions(req.query, page, size);
        return res.json(trxs);
    } catch (error) {
        handler(error, res);
    }
}

module.exports = {
    getTransactions,
}