const listingModel = require("../../models/listing");
const qTransform = require("../../utils/queryTransform");
const {ObjectId} = require("bson");
const user = require("../../models/user");

async function getListings(userId, query, page, limit) {
    const queries = {};

    if (query.deleted !== "true") {
        queries['deleted'] = {$ne: true};
    }

    if (query.cityUrl) {
        queries['city.url'] = query.cityUrl;
    }

    if (query.name) {
        queries['name'] = qTransform.regexLike(query.name);
    }

    if (query.city) {
        queries['city.ID'] = new ObjectId(query.city);
    }

    if (query.exclude) {
        queries['_id'] = {$ne: new ObjectId(query.exclude)};
    }

    if (query.creator) {
        queries['creator'] = new ObjectId(query.creator);
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