const {ObjectId} = require('bson');
const bidModel = require('../models/bid');
const listingModel = require('../models/listing');

/**
 * @param {Object} query
 * @param {Object} user
 */
async function myBid(query, user) {
  const filters = {};
  filters['bidder.id'] = new ObjectId(user._id);
  filters['deleted'] = {$ne: true};
  if (query.status) {
    filters['status'] = query.status;
  }
  const bids = await bidModel.paginate(filters,
      {populate: {
        path: 'listing',
        select: 'name thumbnail tokenIds blockchain',
      }});
  return bids;
}
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
  filters['status'] = 'Submitted';
  filters['deleted'] = {$ne: true};
  if (query.listingID) {
    filters['listing'] = new ObjectId(query.listingID);
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
      .select('_id name owner thumbnail').where({'isPublished': true}).orFail(
          () => Error('Listing Not Found'),
      );
  console.log(listing);
  if (listing.owner == user._id) {
    throw new Error('You cannot bid on your own listing');
  }
  const bids = await bidModel.find({
    'listing': new ObjectId(data.listingID),
    'deleted': false,
  })
      .sort('-price');

  if (bids.length > 0 && bids[0].price > data.price) {
    throw new Error('Your bid is below current highest bid');
  }

  const bid = await bidModel.create({
    bidIndex: data.bidIndex,
    listing: listing._id,
    bidder: {
      id: user._id,
      name: user.username,
      address: user.walletAddress,
    },
    status: 'Submitted',
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
  const listID = new ObjectId(bid.listing);
  const bids = await bidModel.find({
    'listing': listID,
    'deleted': false,
    'status': 'Submitted',
  }).sort('-price');
  const item = await listingModel.findById(listID);
  console.log(bids);
  const bidListing = {
    highest: bids[0] != undefined ? bids[0].price : item.price,
    highestBidder: bids[0] != undefined ? bids[0].bidder.id : '',
    bidCount: bids.length,
    endDate: item.bid.endDate,
    activeAuction: item.bid.activeAuction,
  };
  await listingModel.findByIdAndUpdate(listID, {
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

/**
 * @param {String} listingId
 */
async function close(listingId) {
  console.log('closgin bids');
  const bids = await bidModel.find({
    'listing': new ObjectId(listingId),
    'deleted': {$ne: true},
  })
      .sort('-price');

  console.log(bids.length, ' bids left');
  if (bids.length > 0) {
    await bidModel.updateMany({
      'listing': new ObjectId(listingId),
      'deleted': {$ne: true},
    },
    {status: 'Closed Lose'});

    await bidModel.findByIdAndUpdate(bids[0]._id, {
      status: 'Closed Won',
    });

    // Transfer item to highest bidder as winner
    await listingModel.findByIdAndUpdate(listingId, {owner: bids[0].bidder.id});
  }
}

module.exports = {
  getListingBid,
  add,
  remove,
  myBid,
  close,
};
