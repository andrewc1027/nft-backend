const listingService = require('../services/listingService');
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
  listingService.getAll(query, page, limit, user)
      .then(function(data) {
        return res.json(data);
      })
      .catch((err) => {
        handler(err, res);
      });
}

/**
 * @param {Object} req
 * @param  {Object} res
 * @param  {Object} next
 */
async function detail(req, res, next) {
  listingService.getOne(req.params.id, req.user)
      .then(function(listing) {
        return res.json(listing);
      })
      .catch((err) =>{
        handler(err, res);
      });
}

/**
 * @param {Object} req
 * @param  {Object} res
 * @param  {Object} next
 */
async function insert(req, res, next) {
  if (!req.files.file) {
    return res.status(402).json({
      message: 'Nft file needed',
    });
  }
  listingService.insert(req.body, req.files, req.user)
      .then(function(data) {
        return res.json(data);
      })
      .catch((err)=> {
        console.log(err);
        handler(err, res);
      });
}

/**
 * @param {Object} req
 * @param  {Object} res
 * @param  {Object} next
 */
async function update(req, res, next) {
  listingService.update(
      req.params.id,
      req.files,
      req.body,
      req.user,
  )
      .then(function(data) {
        return res.json(data);
      })
      .catch((err)=> {
        handler(err, res);
      });
}

/**
 *@param {Object} req
 *@param {Object} res
 *@param {Object} next
 */
async function purchase(req, res, next) {
  listingService.purchase(
      req.params.id,
      req.body,
      req.user,
      req.app.get('socketio'),
  )
      .then(function(trade) {
        return res.json(trade);
      })
      .catch((err) => {
        handler(err, res);
      });
}

/**
 *@param {Object} req
 *@param {Object} res
 *@param {Object} next
 */
async function publish(req, res, next) {
  listingService.publish(
      req.params.id,
      req.body,
      req.user,
      req.app.get('socketio'))
      .then(function(trade) {
        return res.json(trade);
      })
      .catch((err) => {
        handler(err, res);
      });
}

/**
 *@param {Object} req
 *@param {Object} res
 *@param {Object} next
 */
async function like(req, res, next) {
  listingService
      .likeCounter(req.params.id, req.user);
  return res.json('ok');
}

/**
 *@param {Object} req
 *@param {Object} res
 *@param {Object} next
 */
async function remove(req, res, next) {
  listingService
      .remove(req.params.id, req.user);
  return res.json('ok');
}

/**
 * @param  {Object} req
 * @param  {Object} res
 * @param  {Object} next
 */
async function explore(req, res, next) {
  const page = req.query.page || 0;
  const limit = req.query.limit || 10;
  const query = req.query;
  listingService.explore(query, page, limit, req.query.sort)
      .then(function(data) {
        return res.json(data);
      })
      .catch((err) => {
        handler(err, res);
      });
}

/**
 *@param {Object} req
 *@param {Object} res
 *@param {Object} next
 */
async function getTags(req, res, next) {
  const tags = await listingService
      .getTags();
  return res.json(tags);
}

/**
 *@param {Object} req
 *@param {Object} res
 *@param {Object} next
 */
async function finishAuction(req, res, next) {
  listingService.finishAuction(req.params.id)
      .then(function(trx) {
        return res.json(trx);
      })
      .catch((e) => {
        handler(e, res);
      });
}

module.exports = {
  index,
  detail,
  purchase,
  like,
  insert,
  update,
  publish,
  remove,
  explore,
  getTags,
  finishAuction,
};
