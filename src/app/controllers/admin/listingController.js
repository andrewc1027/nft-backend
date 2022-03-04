const listingService = require('../../services/admin/listingService');
const {handler} = require('./../errHandler');

async function getListings(req, res, next) {
    const page = req.query.page || 0;
    const limit = req.query.limit || 10;
    const query = req.query;
    const userId = req.params.userId;
    listingService.getListings(userId, query, page, limit)
        .then(function(data) {
            return res.json(data);
        })
        .catch((err) => {
            handler(err, res);
        });
}

module.exports = {
    getListings
}