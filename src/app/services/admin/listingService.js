const listingModel = require("../../models/listing");
const qTransform = require("../../utils/queryTransform");

async function getListings(userId, query, page, limit) {
    const queries = {};

    if (query.search) {
        queries['name'] = qTransform.regexLike(query.search);
    }

    if (userId) {
        queries['owner'] = userId;
    }

    const listings = await listingModel
        .paginate(queries,
            {page: page, limit: limit});
    return listings;
}

module.exports = {
    getListings
}