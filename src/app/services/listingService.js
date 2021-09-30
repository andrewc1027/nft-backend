const listing = require('../models/listing');
const trading = require('../models/tradingHistory');
const userSvc = require('../services/userService');
/**
 * @param {Object} query
 * @param {Number} page
 * @param {Number} limit
 * @return {Array}
 */
async function getAll(query, page, limit) {
  const listings = await listing.paginate({
    // Query Here
  }, {page: page, limit: limit});
  return listings;
}

/**
 * @param {String} id
 */
async function getOne(id) {
  viewCounter(id);
  const detail = await listing.findById(id).orFail(
      () => Error('Not Found'),
  );
  return detail;
}

/**
 * @param {String} id
 * @param {Object} data
 * @param {Object} user
 */
async function purchase(id, data, user) {
  // What if there's 2 simultaneous purchase ?
  const item = await listing.findById(id).orFail(
      () => Error('Listing Not Found'),
  );
  const trade = await trading.create({
    to: user.address,
    from: item.owner,
    price: item.price,
    date: new Date.Now(),
    listingID: id,
    listingCID: item.cid,
  });

  return trade;
}

/**
 * @param {String} id
 */
async function viewCounter(id) {
  const item = await listing.findById(id);
  await listing.findByIdAndUpdate(id, {
    views: item.views+1,
  });
}

/**
 * @param {String} id
 * @param {Object} user
 */
async function likeCounter(id, user) {
  const item = await listing.findById(id);
  await listing.findByIdAndUpdate(id, {
    likes: item.likes+1,
  });

  // Add Listing to User Favourites List
  const userData = await userSvc.find(user.address);
  if (!userData.favourites.includes('id')) {
    userData.favourites.push(id);
  }
}

module.exports = {
  getAll,
  getOne,
  purchase,
  likeCounter,
};
