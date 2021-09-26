const listingService = require('../services/listingService');
/**
 * @param  {Object} req
 * @param  {Object} res
 * @param  {Object} next
 */
async function index(req, res, next) {
  const page = req.query.page || 0;
  const limit = req.query.limit || 10;
  const query = req.query;
  const data = await listingService.getAll(query, page, limit);
  return res.json(data);
}

/**
 * @param {Object} req
 * @param  {Object} res
 * @param  {Object} next
 */
async function detail(req, res, next) {
  const listing = await listingService.getOne(req.params.id);
  return res.json(listing);
}

/**
 *@param {Object} req
 *@param {Object} res
 *@param {Object} next
 */
async function purchase(req, res, next) {
  const trade = await listingService
      .purchase(req.params.id, req.body, req.user);
  return res.json(trade);
}

module.exports = {
  index,
  detail,
  purchase,
};
