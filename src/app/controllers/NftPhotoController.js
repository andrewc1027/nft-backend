const NftService = require('../services/NftPhotoService');
/**
 * @param  {Object} req
 * @param  {Object} res
 * @param  {Object} next
 */
async function index(req, res, next) {
  const query = req.query;
  const user = req.user;
  const data = await NftService.getAll(query, user);
  return res.json(data);
}

/**
 * @param  {Object} req
 * @param  {Object} res
 * @param  {Object} next
 */
async function getOne(req, res, next) {
  const id = req.params.id;
  const data = await NftService.getOne(id);
  return res.json({data});
}

/**
 * @param  {Object} req
 * @param  {Object} res
 * @param  {Object} next
 */
async function insert(req, res, next) {
  const body = req.body;
  const file = req.file;
  if (file==undefined){
    return res.status(402).json({
      message: 'NFT Required',
    });
  }
  const data = await NftService.insert(body, file, req.user);
  return res.json(data);
}

/**
 * @param  {Object} req
 * @param  {Object} res
 * @param  {Object} next
 */
async function update(req, res, next) {
  const data = await NftService.update(id);
  return res.json({data});
}

/**
 * @param  {Object} req
 * @param  {Object} res
 * @param  {Object} next
 */
async function remove(req, res, next) {
  const data = await NftService.remove(id);
  return res.json({data});
}

module.exports = {
  index,
  insert,
  getOne,
  update,
  remove,
};
