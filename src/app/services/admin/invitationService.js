const inviteModel = require('../../models/admin/invitation');
const Joi = require('joi');
const {sendInvite} = require('../notificationService');
const crypto = require('crypto');
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
    email: Joi.string().required(),
  });
  const {error} = schema.validate(data);
  if (error) {
    throw new Error(error);
  }
  const hash = crypto.randomBytes(20).toString('hex');
  const splitEmail = data.email.split('@');
  const invite = await inviteModel.create({
    hash: hash,
    email: data.email,
    username: splitEmail[0],
    invitedAt: Date.now(),
    createdAt: Date.now(),
    status: 'Valid',
    type: 'Invitation',
  });
  sendInvite(invite);
  return invite;
}

module.exports = {
  index,
  add,
};
