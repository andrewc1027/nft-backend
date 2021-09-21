
require('dotenv').config();
const User = require('../models/User');
const jwt = require('jsonwebtoken');

/**
 * @param {String} address
 */
async function findAndSignIn(address) {
  let user;
  const exUser = await User.find({address: address}).limit(1).exec();
  user = exUser[0];
  if (exUser.length == 0) {
    user = await register(address);
  }
  const token = jwt.sign(
      {user: user},
      process.env.JWT_SECRET,
      {expiresIn: process.env.JWT_EXPIRE});

  return {
    user,
    token,
  };
}

/**
 * @param {String} address
 */
async function find(address) {
  const user = await User.findOne({address: address}).exec();
  return user;
}

/**
 * @param {String} address
 */
async function register(address) {
  await User.create({
    address: address,
  });
  const user = await User.findOne({address: address}).exec();
  return user;
}

/**
 * @param {String} id
 * @param {Object} data
 */
async function update(id, data) {
  await User.updateOne({'_id': id}, data);
  const user = await User.findById(id).exec();
  return user;
}

module.exports = {
  find,
  findAndSignIn,
  update,
};
