const nftService = require('../services/nftPhotoService');
const {handler} = require('./errHandler');
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
  nftService.getAll(query, user, page, limit)
      .then(function(data) {
        return res.json(data);
      })
      .catch((err)=>{
        handler(err, res);
      });
}

/**
 * @param  {Object} req
 * @param  {Object} res
 * @param  {Object} next
 */
async function getOne(req, res, next) {
  const id = req.params.id;
  nftService.getOne(id)
      .then(function(data) {
        return res.json(data);
      })
      .catch((err) => {
        handler(err, res);
      });
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
  nftService.insert(body, files, req.user)
      .then(function(data) {
        return res.json(data);
      })
      .catch((err) => {
        handler(err, res);
      });
}

/**
 * @param  {Object} req
 * @param  {Object} res
 * @param  {Object} next
 */
async function update(req, res, next) {
  nftService.update(req.params.id, req.body)
      .then(function(data) {
        return res.json(data);
      })
      .catch((err) => {
        handler(err, res);
      });
}

/**
 * @param  {Object} req
 * @param  {Object} res
 * @param  {Object} next
 */
async function remove(req, res, next) {
  const id = req.params.id;
  nftService.remove(id)
      .then(function(data) {
        return res.json(data);
      })
      .catch((err) => {
        handler(err, res);
      });
}

/**
 * @param  {Object} req
 * @param  {Object} res
 * @param  {Object} next
 */
async function publish(req, res, next) {
  nftService.publish(req.params.id, req.body, req.user)
      .then(function(data) {
        return res.json(data);
      })
      .catch((err)=> {
        handler(err, res);
      });
}

module.exports = {
  index,
  insert,
  getOne,
  update,
  remove,
  publish,
};
