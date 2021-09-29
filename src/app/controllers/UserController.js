const UserService = require('../services/userService');
/**
 * @param  {Object} req
 * @param  {Object} res
 * @param  {Object} next
 */
async function findAndRegister(req, res, next) {
  const {token} = await UserService.findAndSignIn(req.params.address);
  return res.status(200).json({token});
}

/**
 * @param  {Object} req
 * @param  {Object} res
 * @param  {Object} next
 */
async function find(req, res, next) {
  const user = await UserService.find(req.params.address );
  return res.json(user);
}

/**
 * @param  {Object} req
 * @param  {Object} res
 * @param  {Object} next
 */
async function update(req, res, next) {
  const user = await UserService.update(req.user, req.body);
  return res.json(user);
}

module.exports = {
  findAndRegister,
  find,
  update,
};
