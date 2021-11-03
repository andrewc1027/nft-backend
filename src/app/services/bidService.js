const bidModel = require('../models/bid');
const listingModel = require('../models/listing');
/**
 * @param {ObjectID} listingID
 * @return {Array}
 */
async function getListingBid(listingID) {
  const bids = await bidModel.paginate();
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
