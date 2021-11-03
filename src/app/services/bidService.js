const bidModel = require('../models/bid');
const listingModel = require('../models/listing');
/**
 * @param {ObjectID} listingID
 * @return {Array}
 */
async function getListingBid(listingID) {
  const bids = await bidModel.find();
  return bids;
}

/**
 *
 * @param {ObjectId} listingID
 * @param {Object} data
 * @param {Object} user
 */
async function add(listingID, data, user) {
  const listing = await listingModel.findById(listingID).select('_id name');
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
  });
}

module.exports = {
  getListingBid,
  add,
};
