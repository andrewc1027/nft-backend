const tokenService = require('../services/tokenService');
const {handler} = require('./errHandler');

/**
 * @param  {Object} req
 * @param  {Object} res
 * @param  {Object} next
 */
async function getMetadata(req, res, next) {
  try {
    const data = await tokenService.getMetadata(req.params.token);
    return res.json(data);
  } catch (e) {
    handler(e, res);
  }

}

/**
 * @param  {Object} req
 * @param  {Object} res
 * @param  {Object} next
 */
async function getPolygonMetadata(req, res, next) {
  const data = await tokenService.getPolygonMetadata(req.params.token);
  return res.json(data);
}

module.exports = {
  getMetadata,
  getPolygonMetadata,
};