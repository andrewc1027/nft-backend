const tradingService = require('../services/tradingService');
/**
 * @param  {Object} req
 * @param  {Object} res
 * @param  {Object} next
 */
async function index(req, res, next) {
  const page = req.query.page || 0;
  const limit = req.query.limit || 10;
  const query = req.query;
  const data = await tradingService.getAll(query, page, limit);
  return res.json(data);
}

module.exports = {
  index,
};
