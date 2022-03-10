const listingService = require('../../services/admin/listingService');
const {handler} = require('./../errHandler');

async function getListings(req, res, next) {
    const page = req.query.page || 0;
    const limit = req.query.limit || 1000;
    const query = req.query;
    listingService.getListings(query, page, limit, query.sort_by)
        .then(function(data) {
            return res.json(data);
        })
        .catch((err) => {
            handler(err, res);
        });
}

module.exports = {
    getListing: getListings
}