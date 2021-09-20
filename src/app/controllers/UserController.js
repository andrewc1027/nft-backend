const UserService = require('../services/UserService');
/**
 * @param  {Object} req
 * @param  {Object} res
 * @param  {Object} next
 */
async function findAndRegister(req, res, next) {
  const user = await UserService.findAndRegister(req.params.address);
  console.log(user);
  res.json({user: user});
}

/**
 * @param  {Object} req
 * @param  {Object} res
 * @param  {Object} next
 */
async function find(req, res, next) {
  const user = await UserService.find(req.params.address);
  return res.json(user);
}

module.exports = {
  findAndRegister,
  find,
};
