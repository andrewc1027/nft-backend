const NftService = require('../services/nftPhotoService');
/**
 * @param  {Object} req
 * @param  {Object} res
 * @param  {Object} next
 */
async function index(req, res, next) {
  const page = req.query.page || 0;
  const limit = req.query.limit || 10;
  const query = req.query;
  const user = req.user;
  const data = await NftService.getAll(query, user, page, limit);
  return res.json(data);
}

/**
 * @param  {Object} req
 * @param  {Object} res
 * @param  {Object} next
 */
async function getOne(req, res, next) {
  const id = req.params.id;
  try {
    const data = await NftService.getOne(id);
    return res.json(data);
  } catch (err) {
    return res.status(404).json(err);
  }
}

/**
 * @param  {Object} req
 * @param  {Object} res
 * @param  {Object} next
 */
async function insert(req, res, next) {
  const body = req.body;
  const files = req.files;
  if (files.raw==undefined) {
    return res.status(402).json({
      message: 'Raw NFT Required',
    });
  }
  const data = await NftService.insert(body, files, req.user);
  return res.json(data);
}

/**
 * @param  {Object} req
 * @param  {Object} res
 * @param  {Object} next
 */
async function update(req, res, next) {
  const data = await NftService.update(req.params.id, req.body);
  return res.json(data);
}

/**
 * @param  {Object} req
 * @param  {Object} res
 * @param  {Object} next
 */
async function remove(req, res, next) {
  const id = req.params.id;
  const data = await NftService.remove(id);
  return res.json(data);
}

module.exports = {
  index,
  insert,
  getOne,
  update,
  remove,
};
