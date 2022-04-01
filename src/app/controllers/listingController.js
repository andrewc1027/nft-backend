const listingService = require('../services/listingService');
const http = require('https');
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
  const incPageViewCounter = !req.rawHeaders.includes('node-fetch/1.0 (+https://github.com/bitinn/node-fetch)');
  listingService.getOne(req.params.id, req.user, incPageViewCounter)
    .then(function(listing) {
      return res.json(listing);
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
async function insert(req, res, next) {
  if (!req.files.file) {
    return res.status(402).json({
      message: 'Nft file needed',
    });
  }
  listingService.insert(req.body, req.files, req.user, req.app.get('socketio'))
    .then(function(data) {
      return res.json(data);
    })
    .catch((err) => {
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
    .catch((err) => {
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
async function depublish(req, res, next) {
  listingService.depublish(
    req.params.id, req.user)
    .then(function(item) {
      return res.json(item);
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
    .remove(req.params.id, req.user).then(function(item) {
      return res.json('ok');
    }).catch((e) => {
      handler(e, res);
    });
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
  listingService.finishAuction(req.params.id, req.user)
    .then(function(trx) {
      return res.json(trx);
    })
    .catch((e) => {
      handler(e, res);
    });
}

/**
 *@param {Object} req
 *@param {Object} res
 *@param {Object} next
 */
async function download(req, res, next) {
  try {
    const listing = await listingService.download(req.params.id);
    http.get(listing.downloadLink, function(file) {
      res.header('Content-Disposition', `attachment; filename="${listing._id}.zip"`);
      file.pipe(res);
    });
  } catch (e) {
    handler(e, res);
  }


}

/**
 *@param {Object} req
 *@param {Object} res
 *@param {Object} next
 */
async function indexer(req, res, next) {
  listingService.indexer()
    .then(function() {
      return res.json('ok');
    })
    .catch((e) => {
      handler(e, res);
    });
}

/**
 *@param {Object} req
 *@param {Object} res
 *@param {Object} next
 */
async function getListingsByUsername(req, res, next){
  const page = req.query.page || 0;
  const limit = req.query.limit || 10;
  listingService.getListingsByUsername(req.params.username, page, limit, req.query.sort)
      .then(function (data) {
        return res.json(data);
      })
      .catch((err)=>{
        handler(err, res);
      });
}

/**
 *@param {Object} req
 *@param {Object} res
 *@param {Object} next
 */
async function getSoldListingsByUsername(req, res, next){
  const page = req.query.page || 0;
  const limit = req.query.limit || 10;
  listingService.getSoldListingsByUsername(req.params.username, page, limit, req.query.sort)
      .then(function (data) {
        return res.json(data);
      })
      .catch((err)=>{
        handler(err, res);
      });
}

async function getMarkers(req, res, next) {
  const page = req.query.page || 0;
  const limit = req.query.limit || 10;
  const query = req.query;
  listingService.getMarkers(query, page, limit, req.query.sort)
      .then(function(data) {
        return res.json(data);
      })
      .catch((err) => {
        handler(err, res);
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
  depublish,
  remove,
  explore,
  getTags,
  finishAuction,
  download,
  indexer,
  getListingsByUsername,
  getSoldListingsByUsername,
  getMarkers,
};
