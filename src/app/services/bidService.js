const {ObjectId} = require('bson');
const bidModel = require('../models/bid');
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
  if (query.listingID) {
    filters['listing.id'] = new ObjectId(listingID);
  }
  if (query.bidderID) {
    filters['bidder.id'] = new ObjectId(bidderID);
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
      .select('_id name').where({'isPublished': true}).orFail(
          () => Error('Listing Not Found'),
      );
  return await bidModel.create({
    listing: {
      id: listing._id,
      name: listing.name,
    },
    bidder: {
      id: user._id,
      name: user.username,
    },
    price: data.price,
    createdAt: Date.now(),
  });
}

/**
 * @param {ObjectId} id
 */
async function remove(id) {
  return await bidModel.findByIdAndDelete(id);
}

module.exports = {
  getListingBid,
  add,
  remove,
};
