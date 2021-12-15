const transaction = require('../models/transaction');
/**
 * @param {Object} query
 * @return {Array}
 */
async function getAll(query) {
  const queries = {};

  if (query.listingID) {
    queries['listingID'] = query.listingID;
  }
  const histories = await transaction.paginate(
      queries,
  );
  return histories;
}

/**
 * get transactions for specific user
 * @param {Object} user
 * @param {Number} page
 * @param {Number} limit
 */
async function me(user, page, limit) {
  const trx = await transaction.find({
    $or: [{'from': user._id}, {'to': user._id}],
  }).populate('listingID', 'name thumbnail');
  return trx;
}

module.exports = {
  getAll,
  me,
};
