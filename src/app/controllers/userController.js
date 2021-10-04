const UserService = require('../services/userService');
const {handler} = require('./errHandler');
/**
 * @param  {Object} req
 * @param  {Object} res
 * @param  {Object} next
 */
async function findAndRegister(req, res, next) {
  const {token, signedUser} = await UserService
      .findAndSignIn(req.params.address);
  return res.status(200).json({
    token: token,
    user: signedUser,
  });
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
  await UserService.update(req.user, req.body)
      .then(function(token) {
        return res.json({token});
      })
      .catch((err) => {
        handler(err, res);
      });
}

module.exports = {
  findAndRegister,
  find,
  update,
  me,
};
