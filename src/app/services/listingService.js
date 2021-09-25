const listing = require('../models/listing');
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
  const detail = await listing.findById(id).orFail(
      () => Error('Not Found'),
  );
  return detail;
}

/**
 *
 * @param {String} id
 */
async function purchase(id) {

}
module.exports = {
  getAll,
  getOne,
};
