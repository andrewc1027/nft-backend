const trading = require('../models/tradingHistory');
/**
 * @param {Object} query
 * @return {Array}
 */
async function getAll(query) {
  const histories = await trading.paginate(
      {listingID: query.listingID},
  );
  return histories;
}

module.exports = {
  getAll,
};
