const transaction = require('../models/transaction');
/**
 * @param {Object} query
 * @return {Array}
 */
async function getAll(query) {
  const histories = await transaction.paginate(
      {listingID: query.listingID},
  );
  return histories;
}

module.exports = {
  getAll,
};
