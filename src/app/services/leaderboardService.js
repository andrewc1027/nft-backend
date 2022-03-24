const listingModel = require('../models/listing');
const userService = require('../services/userService');
const {ObjectId} = require("mongodb");

async function getCreators() {
    const filters = {};
    filters['deleted'] = {$ne: true};
    const listings = await listingModel.find(filters, {});

    const creators = [];
    listings.forEach((listing) => {
        creators.push(listing.creator.toString());
    });
    return new Set(creators);
}

async function getItemsByCreator(creator) {
    const filters = {};
    filters['deleted'] = {$ne: true};
    filters['creator'] = new ObjectId(creator);
    const listings = await listingModel.find(filters);
    return listings;
}

/**
 *
 * @param query
 */
async function index(query) {
    const leaderboard = [];
    const creatorIds = await getCreators();
    for (const creatorId of creatorIds) {
        const creatorDetails = await userService.find(creatorId);
        const listings = await getItemsByCreator(creatorId);
        const prices = [];
        for (let i = 0; i < listings.length; i++) {
            if (listings[i].price) {
                prices.push(listings[i].price);
            }
        }
        let floorPrice = Math.min(...prices);
        if (floorPrice === Infinity) {
            floorPrice = 0;
        }
        leaderboard.push({
            "_id": creatorId,
            "name": creatorDetails.username,
            "floorPrice": floorPrice,
            "items": listings.length,
        });
    }
    const sort = query.sort ??= "items:desc";
    const sortBy = sort.split(':');
    const orderBy = sortBy[1] === 'asc' ? '1' : '-1';

    if (sortBy[0] === "name") {
        leaderboard.sort((a, b) => {
            if (a.name < b.name) {
                return -1 * orderBy;
            }
            if (a.name > b.name) {
                return 1 * orderBy;
            }
            return 0;
        });
    } else if (sortBy[0] === "price") {
        leaderboard.sort((a, b) => {
            return (a.floorPrice - b.floorPrice) * orderBy;
        });
    } else {    // else sort by quantity of items
        leaderboard.sort((a, b) => {
            return (a.items - b.items) * orderBy;
        });
    }
    return leaderboard;
}

module.exports = {
    index
}