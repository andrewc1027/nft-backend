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
  listingService.getAll(query, page, limit)
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
  listingService.getOne(req.params.id)
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
  listingService.update(req.body, req.files, req.user)
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
  listingService.purchase(req.params.id, req.body, req.user)
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


module.exports = {
  index,
  detail,
  purchase,
  like,
  insert,
  update,
};
