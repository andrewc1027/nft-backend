const inviteModel = require('../../models/inviteCode');
const Joi = require('joi');
const {sendInvite} = require('../notificationService');
/**
 * @param {Object} query
 * @param {Number} page
 * @param {Number} size
 * @param {Number} limit
 */
async function index(query, page, size, limit) {
  const invites = await inviteModel.paginate({}, {page: page, size: size});
  return invites;
}

/**
 * @param {Object} data
 */
async function add(data) {
  const schema = Joi.object({
    code: Joi.string().required(),
    email: Joi.string().required(),
  });
  const {error} = schema.validate(data, {allowUnknown: true});
  if (error) {
    throw new Error(error);
  }
  return await inviteModel.create(data);
}

/**
 * @param {String} id
 */
async function send(id) {
  const invitation = await inviteModel.findById(id);
  sendInvite(invitation);
}

module.exports = {
  index,
  add,
  send,
};
