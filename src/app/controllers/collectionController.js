const collectionSvc = require('../services/collectionService');
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
  collectionSvc.getAll(query, user, page, limit)
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
  collectionSvc.getOne(id)
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
async function insert(req, res, next) {
  const body = req.body;
  const files = req.files;
  if (files.logoImage==undefined) {
    return res.status(402).json({
      message: 'Logo File Required',
    });
  }
  collectionSvc.insert(body, files, req.user)
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
async function update(req, res, next) {
  let files = {};
  if (req.files) {
    files = req.files;
  }
  collectionSvc.update(req.params.id, req.body, files)
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
async function remove(req, res, next) {
  const id = req.params.id;
  collectionSvc.remove(id)
      .then(function(data) {
        return res.json(data);
      })
      .catch((err)=>{
        handler(err, res);
      });
}


module.exports = {
  index,
  insert,
  getOne,
  update,
  remove,
};
