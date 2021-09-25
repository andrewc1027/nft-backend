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


module.exports = {
  index,
  detail,
};
