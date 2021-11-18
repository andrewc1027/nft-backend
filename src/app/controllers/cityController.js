const citySvc = require('../services/cityService');
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
  citySvc.getAll(query, user, page, limit)
      .then(function(data) {
        return res.json(data);
      })
      .catch((err)=> {
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
  citySvc.getOne(id)
      .then(function(data) {
        return res.json(data);
      })
      .catch((err)=> {
        handler(err, res);
      });
}

/**
 * @param  {Object} req
 * @param  {Object} res
 * @param  {Object} next
 */
async function getAutocomplete(req, res, next) {
  const suggestions = await citySvc
      .getAutocomplete(req.query, req.query.limit);
  return res.json(suggestions);
}

/**
 * @param  {Object} req
 * @param  {Object} res
 * @param  {Object} next
 */
async function add(req, res, next) {
  citySvc.add(req.body).then(function(city) {
    return res.json(city);
  }).catch((e)=> {
    handler(e, res);
  });
}

module.exports = {
  index,
  getOne,
  getAutocomplete,
  add,
};
