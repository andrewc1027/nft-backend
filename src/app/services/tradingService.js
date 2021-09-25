const trading = require('../models/tradingHistory');
/**
 * @param {Object} query
 * @return {Array}
 */
async function getAll(query) {
  const histories = await trading.paginate(
      {nftID: query.nftID},
  );
  return histories;
}

/**
 * @param {Object} data
 */
async function insert(data) {
  const trade = await trading.create({
    to: data.to,
    from: data.from,
  });
  return trade;
}

module.exports = {
  getAll,
  insert,
};
