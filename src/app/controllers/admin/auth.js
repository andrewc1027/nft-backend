const authSvc = require('../../services/admin/authService');
const {handler} = require('./../errHandler');
/**
 * @param  {Object} req
 * @param  {Object} res
 * @param  {Object} next
 */
async function login(req, res, next) {
  await authSvc.login(req.body)
      .then(function(token) {
        return res.json({token: token});
      })
      .catch((e) => {
        handler(e, res);
      });
}

/**
 *
 * @param {Object} req
 * @param {Object} res
 */
async function register(req, res) {
  await authSvc.register(req.body)
      .then(function(admin) {
        return res.json(admin);
      })
      .catch((e) => {
        handler(e, res);
      });
}
module.exports = {
  login,
  register,
};
