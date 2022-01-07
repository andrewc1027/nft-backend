const invService = require('../../services/admin/invitationService');
const {handler} = require('./../errHandler');
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
  const bids = await invService.index(query, page, limit, sort);
  return res.json(bids);
}

/**
 * @param  {Object} req
 * @param  {Object} res
 * @param  {Object} next
 */
async function add(req, res, next) {
  invService.add(req.body, req.user)
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
    const bid = await invService.remove(req.params.id);
    return res.json(bid);
  } catch (e) {
    handler(e, res);
  }
}

module.exports = {
  index,
  add,
  remove,
};
