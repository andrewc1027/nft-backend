const UserService = require('../services/userService');
const {handler} = require('./errHandler');
/**
 * @param  {Object} req
 * @param  {Object} res
 * @param  {Object} next
 */
async function findAndRegister(req, res, next) {
  try {
    const {token, signedUser} = await UserService
        .findAndSignIn(req.params.address, req.body);
    return res.status(200).json({
      token: token,
      user: signedUser,
    });
  } catch (e) {
    handler(e, res);
  }
}

/**
 * @param  {Object} req
 * @param  {Object} res
 * @param  {Object} next
 */
async function find(req, res, next) {
  UserService.find(req.params.id)
      .then(function(user) {
        return res.json(user);
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
async function me(req, res, next) {
  UserService.me(req.user)
      .then(function(user) {
        return res.json(user);
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
  await UserService.update(req.user, req.body, req.files)
      .then(function(token) {
        return res.json({token});
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
async function checkWallet(req, res, next) {
  UserService.checkWallet(req.params.wallet)
      .then(function(acc) {
        return res.json(acc);
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
async function sendVerifyEmail(req, res, next) {
  UserService.sendVerifyEmail(req.params.id)
      .then(function(acc) {
        return res.json(acc);
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
async function getUserByUsername(req, res, next) {
    const projection = req.query.projection ??= {};
    UserService.getUserByUsername(req.params.username, projection)
        .then(function (data) {
            return res.json(data);
        })
        .catch((err)=>{
            handler(err, res);
        });
}


module.exports = {
    findAndRegister,
    find,
    update,
    me,
    checkWallet,
    sendVerifyEmail,
    getUserByUsername
};
