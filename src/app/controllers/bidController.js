const bidService = require('../services/bidService');
/**
 * @param  {Object} req
 * @param  {Object} res
 * @param  {Object} next
 */
async function index(req, res, next) {
  const bids = await bidService.getListingBid(req.params.listingID);
  return res.json(bids);
}

/**
 * @param  {Object} req
 * @param  {Object} res
 * @param  {Object} next
 */
async function add(req, res, next) {
  const bid = await bidService.add(req.params.listingID, req.body, req.user);
  return res.json(bid);
}

module.exports = {
  index,
  add,
};
