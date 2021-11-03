const bidService = require('../services/bidService');
const {handler} = require('./errHandler');
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
  bidService.add(req.body, req.user)
      .then(function(bid) {
        return res.json(bid);
      })
      .catch((e) => {
        handler(e, res);
      });
}

/**
 * @param  {Object} req
 * @param  {Object} res
 * @param  {Object} next
 */
async function remove(req, res, next) {
  const bid = await bidService.remove(req.params.id);
  return res.json(bid);
}

module.exports = {
  index,
  add,
  remove,
};
