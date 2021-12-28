const bidService = require('../services/bidService');
const {handler} = require('./errHandler');
/**
 * @param  {Object} req
 * @param  {Object} res
 * @param  {Object} next
 */
async function index(req, res, next) {
  const page = req.query.page || 0;
  const limit = req.query.limit || 10;
  const sort = req.query.sort;
  const query = req.query;
  const bids = await bidService.getListingBid(query, page, limit, sort);
  return res.json(bids);
}

/**
 * @param  {Object} req
 * @param  {Object} res
 * @param  {Object} next
 */
async function myBid(req, res, next) {
  const query = req.query;
  const user = req.user;
  const bids = await bidService.myBid(query, user);
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
  try {
    const bid = await bidService.remove(req.params.id);
    return res.json(bid);
  } catch (e) {
    handler(e, res);
  }
}

module.exports = {
  index,
  add,
  remove,
  myBid,
};
