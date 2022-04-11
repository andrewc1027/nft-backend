const listingModel = require('../models/listing');
const trxModel = require('../models/transaction');
const userService = require('../services/userService');
const {ObjectId} = require("mongodb");

/**
 * 
 * @param {Object} query 
 * @returns 
 */
async function getCreators(query) {
    const filters = {};
    filters['deleted'] = {$ne: true};
    if (query.resource && query.resource !== 'all') {
        filters['resource'] = query.resource;
    }
    if (query.blockchain && query.blockchain !== 'all') {
        filters['blockchain'] = query.blockchain;
    }
    if (query.listings) {
        filters['_id'] = {$in: query.listings};
    }
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
 * @param {String} creatorId
 * @returns {Promise<*>}
 */
async function countVolume(creatorId) {
    const trxs = await trxModel.find({"from": creatorId})
    return trxs.reduce(function(a, b) {
        if (b.price === undefined) {
            b.price = 0;
        }
        return a + b.price;
    }, 0);
}

/**
 * 
 * @param {Array} listings 
 */
async function getOwner(listings) {
    const uniqueOwner = [...new Set(listings.map(item => item.owner))];
    return new Set(uniqueOwner).size;
}

/**
 * 
 * @param {Object} query 
 */
async function getTransactions(query) {
    if (!query.endDate) {
        query.endDate = Date.now();
    }
    let date_from = new Date(query.startDate);
    date_from = new Date(date_from.setDate(date_from.getDate())).toISOString();
    let date_to = new Date(query.endDate);
    date_to = new Date(date_to.setDate(date_to.getDate()+1)).toISOString();
    const trxs = await trxModel.find({
        date: {
            $gte: date_from,
            $lt: date_to,
        }
    })
    const listings = [...new Set(trxs.map(item => item.listingID))];
    return listings;
}

/**
 *
 * @param query
 */
async function index(query) {
    const leaderboard = [];
    if (query.startDate) {
        const listings = await getTransactions(query);
        query.listings = listings;
    }
    const creatorIds = await getCreators(query);
    for (const creatorId of creatorIds) {
        const creatorDetails = await userService.find(creatorId);
        const listings = await getItemsByCreator(creatorId);
        const totalOwner = await getOwner(listings);

        const volume = await countVolume(creatorId);
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
            "userLogo": creatorDetails.logoImage ?? "",
            "volume": volume ?? 0,
            "owner": totalOwner ?? 0,
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
    } else if (sortBy[0] === "volume") {
        leaderboard.sort((a, b) => {
            return (a.volume - b.volume) * orderBy;
        });
    } else if (sortBy[0] === "owner") {
        leaderboard.sort((a, b) => {
            return (a.owner - b.owner) * orderBy;
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
