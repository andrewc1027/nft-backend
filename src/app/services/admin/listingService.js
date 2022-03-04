const listingModel = require("../../models/listing");
const qTransform = require("../../utils/queryTransform");

async function getListings(userId, query, page, limit) {
    const filters = {};
    const ors = [];

    if (query.search) {
        const q = query.search;
        ors.push({'name': qTransform.regexLike(q)});
        ors.push({'description': qTransform.regexLike(q)});
        ors.push({'address': qTransform.regexLike(q)});
        ors.push({'city.name': qTransform.regexLike(q)});
        ors.push({'city.url': qTransform.regexLike(q)});
        ors.push({'tags': qTransform.regexLike(q)});
        ors.push({'blockchain': qTransform.regexLike(q)});
        ors.push({'tokenID': qTransform.regexLike(q)});
        ors.push({'buyerAddress': qTransform.regexLike(q)});
        ors.push({'resource': qTransform.regexLike(q)});
        ors.push({'link360': qTransform.regexLike(q)});
        ors.push({'bid.highestBidder': qTransform.regexLike(q)});
        ors.push({'downloadLink': qTransform.regexLike(q)});
    }

    if (userId) {
        filters['owner'] = userId;
    }

    if (ors.length > 0) {
        filters['$or'] = ors;
    }

    const listings = await listingModel
        .paginate(filters,
            {page: page, limit: limit});
    return listings;
}

module.exports = {
    getListings
}