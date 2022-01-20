const tokenService = require('../services/tokenService');
/**
 * @param  {Object} req
 * @param  {Object} res
 * @param  {Object} next
 */
async function getMetadata(req, res, next) {
  const data = await tokenService.getMetadata(req.params.token);
  return res.json(data);
}

module.exports = {
  getMetadata,
};