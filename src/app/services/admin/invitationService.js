const inviteModel = require('../../models/admin/invitation');
const Joi = require('joi');
const {sendInvite} = require('../notificationService');
const jwt = require('jsonwebtoken');
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
  const token = await jwt.sign(data, process.env.JWT_SECRET,
      {expiresIn: '10d'});
  const invite = await inviteModel.create({
    token: token,
    email: data.email,
    invitedAt: Date.now(),
    createdAt: Date.now(),
    status: 'Valid',
  });
  return invite;
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
