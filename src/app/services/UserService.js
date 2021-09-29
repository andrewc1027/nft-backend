
require('dotenv').config();
const user = require('../models/user');
const jwt = require('jsonwebtoken');

/**
 * @param {String} address
 */
async function findAndSignIn(address) {
  let signedUser = {};
  const exUser = await user.findOne({address: address});
  if (!exUser) {
    signedUser = await register(address);
  } else {
    signedUser = exUser;
  }

  const token = jwt.sign(
      {signedUser},
      process.env.JWT_SECRET,
      {expiresIn: process.env.JWT_EXPIRE});
  await user.findByIdAndUpdate(signedUser._id, {lastLoginAt: Date.now()});
  return {
    signedUser,
    token,
  };
}

/**
 * @param {String} address
 */
async function find(address) {
  const data = await user.findOne({address: address}).exec();
  return data;
}

/**
 * @param {String} address
 */
async function register(address) {
  await user.create({
    walletAddress: address,
  });
  const data = await user.findOne({address: address}).exec();
  return data;
}

/**
 * @param {Object} userRequest
 * @param {Object} data
 */
async function update(userRequest, data) {
  await user.updateOne({'_id': userRequest._id}, data);
  const res = await user.findById(userRequest._id).exec();
  return res;
}

/**
 * @param {String} userID
 */
async function getUserFavourites(userID) {
  const favs = user.findOne({'_id': userID}).select('favourites');
  return favs;
}

/**
 * @param {String} userID
 */
async function addUserFavourites(userID) {
  const favs = user.findOne({'_id': userID}).select('favourites');
  return favs;
}


module.exports = {
  find,
  findAndSignIn,
  update,
  getUserFavourites,
  addUserFavourites,
};
