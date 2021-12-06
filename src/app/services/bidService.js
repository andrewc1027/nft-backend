const {ObjectId} = require('bson');
const bidModel = require('../models/bid');
const listing = require('../models/listing');
const listingModel = require('../models/listing');
/**
 * @param {Object} query
 * @param {Number} page
 * @param {Number} limit
 * @param {String} sort
 * * @return {Array}
 */
async function getListingBid(query, page, limit, sort = 'price:asc') {
  const field = sort.split(':');
  const orderBy = field[1] == 'asc' ? '-1': '1';
  const filters = {};
  filters['deleted'] = {$ne: true};
  if (query.listingID) {
    filters['listing.id'] = new ObjectId(query.listingID);
  }
  if (query.bidderID) {
    filters['bidder.id'] = new ObjectId(query.bidderID);
  }
  const bids = await bidModel.paginate(filters, {
    page: page,
    limit: limit,
    sort: {[field[0]]: orderBy},
  });
  return bids;
}

/**
 * @param {Object} data
 * @param {Object} user
 */
async function add(data, user) {
  const listing = await listingModel.findById(data.listingID)
      .select('_id name owner').where({'isPublished': true}).orFail(
          () => Error('Listing Not Found'),
      );

  if (listing.owner == user._id) {
    throw new Error('You cannot bid on your own listing');
  }
  const bids = await bidModel.find({
    'listing.id': new ObjectId(data.listingID),
    'deleted': false,
  })
      .sort('-price');

  if (bids.length > 0 && bids[0].price > data.price) {
    throw new Error('Your bid is below current highest bid');
  }

  const bid = await bidModel.create({
    listing: {
      id: listing._id,
      name: listing.name,
    },
    bidder: {
      id: user._id,
      name: user.username,
      address: user.walletAddress,
    },
    expireAt: data.expireAt,
    floorDifference: data.floorDifference,
    price: data.price,
    createdAt: Date.now(),
  });
  updateListingBid(bid);
  return bid;
}

/**
 * @param {*} bid
 */
async function updateListingBid(bid) {
  const listID = new ObjectId(bid.listing.id);
  const bids = await bidModel.find({
    'listing.id': listID,
    'deleted': false,
  }).sort('-price');
  const bidListing = {
    highest: bids[0].price || 0,
    highestBidder: bids[0].bidder.id,
    bidCount: bids.length,
  };
  await listing.findByIdAndUpdate(listID, {
    bid: bidListing,
  });
  return bidListing;
}

/**
 * @param {ObjectId} id
 */
async function remove(id) {
  await bidModel.deleteById(id).orFail(
      () => Error('Not Found'),
  );
  const bid = await bidModel.findById(id);
  updateListingBid(bid);
  return 'ok';
}

module.exports = {
  getListingBid,
  add,
  remove,
};
