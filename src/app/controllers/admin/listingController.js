const listingService = require('../../services/admin/listingService');
const {handler} = require('./../errHandler');
const http = require("https");

async function getListings(req, res, next) {
    const page = req.query.page || 0;
    const limit = req.query.limit || 1000;
    const query = req.query;
    listingService.getListings(query, page, limit, query.sort_by)
        .then(function (data) {
            return res.json(data);
        })
        .catch((err) => {
            handler(err, res);
        });
}


/**
 *@param {Object} req
 *@param {Object} res
 *@param {Object} next
 */
async function download(req, res, next) {
    try {
        const listing = await listingService.download(req.params.id);
        const originalName = listing.nfts[0].ipfs.file.originalName.replace(/\s/g, '_');
        http.get(listing.nfts[0].ipfs.file.path, function(file) {
            res.header('Content-Disposition', `attachment; filename="${listing._id}_${originalName}"`);
            file.pipe(res);
        });
    } catch (e) {
        handler(e, res);
    }
}

module.exports = {
    getListings,
    download
}