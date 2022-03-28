
require('dotenv').config();
const user = require('../models/user');
const verify = require('../models/admin/invitation');
const jwt = require('jsonwebtoken');
const s3 = require('../config/s3');
const fs = require('fs');
const {PutObjectCommand} = require('@aws-sdk/client-s3');
const {DocumentNotFoundError} = require('mongoose').Error;
const {sendVerifyRequest} = require('./notificationService');
const crypto = require('crypto');

/**
 * @param {String} address
 * @param {Object} data
 */
async function findAndSignIn(address, data = {}) {
  let signedUser = {};
  let email = data.email ??= '';
  let username = data.username ??= '';
  let verified = false;
  const exUser = await user.findOne({walletAddress: address.toLowerCase()});
  email = exUser ? exUser.email : email;
  username = exUser ? exUser.username : username;
  let inv = exUser ? exUser.invited : false;
  verified = exUser ? exUser.verified : verified;
  if (data.invite) {
    const invite = await validateInviteCode(data.invite, address);
    inv = true;
    email = invite.email;
  }
  if (data.verify) {
    const verify = await validateInviteCode(data.verify, address);
    verified = true;
  }
  if (!exUser) {
    signedUser = await register(address, data);
  } else {
    signedUser = exUser;
  }
  signedUser.invited = inv;
  signedUser.verified = verified;
  signedUser.email = email;
  signedUser.username = username;
  signedUser.lastLoginAt = Date.now();
  await signedUser.save();
  const token = jwt.sign(
      {signedUser},
      process.env.JWT_SECRET,
      {expiresIn: process.env.JWT_EXPIRE});
  return {
    signedUser,
    token,
  };
}

/**
 * @param {String} hash
 * @param {String} address
 */
async function validateInviteCode(hash, address) {
  const invite = await verify.findOne({
    status: 'Valid',
    hash: hash,
  }).orFail(() => new DocumentNotFoundError('Code Not Found or Invalid'));
  invite.status = 'Used';
  invite.save();
  return invite;
}

/**
 * @param {String} id
 */
async function find(id) {
  const data = await user.findById(id).orFail(
      () => new DocumentNotFoundError('User not Found'));
  return data;
}

/**
 * @param {String} self
 */
async function me(self) {
  const data = await user.findById(self._id).orFail(
      () => new DocumentNotFoundError('User not Found'));
  return data;
}

/**
 * @param {String} address
 * @param {object} data
 */
async function register(address, data) {
  const newUser = await user.create({
    walletAddress: address.toLowerCase(),
    createdAt: Date.now(),
    email: data.email, 
    username: data.username,
  });
  if (data.email) {
    const hash = crypto.randomBytes(20).toString('hex');
    const newVerif = await verify.create({
      hash: hash,
      email: data.email,
      invitedAt: Date.now(),
      createdAt: Date.now(),
      status: 'Valid',
      type: 'Verification',
    });
    sendVerifyRequest(newVerif);
  }
  return newUser;
}

/**
 * @param {Object} userRequest
 * @param {Object} data
 * @param {Object} files
 */
async function update(userRequest, data, files = {}) {
  if (files.logoImage) {
    const buffer = fs.readFileSync(files.logoImage[0].path);
    const param = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: `${files.logoImage[0].filename}`,
      Body: buffer,
      ContentType: files.logoImage[0].mimetype,
      ACL: 'public-read',
    };
    await s3.send(new PutObjectCommand(param));
    // eslint-disable-next-line max-len
    data.logoImage = `${process.env.AWS_BUCKET_URL}${files.logoImage[0].filename}`;
  }
  if (files.bannerImage) {
    const buffer = fs.readFileSync(files.bannerImage[0].path);
    const param = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: `${files.bannerImage[0].filename}`,
      Body: buffer,
      ContentType: files.bannerImage[0].mimetype,
      ACL: 'public-read',
    };
    await s3.send(new PutObjectCommand(param));
    // eslint-disable-next-line max-len
    data.bannerImage = `${process.env.AWS_BUCKET_URL}${files.bannerImage[0].filename}`;
  }
  await user.findByIdAndUpdate(userRequest._id, data, {
    runValidators: true, context: 'query',
  });
  const {token} = await findAndSignIn(userRequest.walletAddress);
  return token;
}

/**
 * @param {String} userID
 */
async function getUserFavourites(userID) {
  const favs = await user.findOne({'_id': userID}).select('favourites');
  return favs;
}

/**
 * @param {String} address
 */
async function checkWallet(address) {
  const acc = await user.findOne({walletAddress: address.toLowerCase()})
      .orFail(() => new DocumentNotFoundError('Wallet Not Exists'));
  return acc;
}
/**
 * @param {String} id
 */
async function addUserFavourites(id) {
  const favs = user.findOne({'_id': id}).select('favourites');
  return favs;
}

/**
 * 
 * @param {String} id 
 */
async function sendVerifyEmail(id) {
  const usr = await user.findById(id);
  const hash = crypto.randomBytes(20).toString('hex');
    const verifyData = await verify.create({
      hash: hash,
      email: usr.email,
      username: usr.username,
      invitedAt: Date.now(),
      createdAt: Date.now(),
      status: 'Valid',
      type: 'Verification',
    });
    sendVerifyRequest(verifyData);  
}

/**
 *
 * @param {String} username
 * @param {Object} projection
 */
async function getUserByUsername(username, projection){
  const data = await user.findOne({"username": username}, projection).orFail(
      () => new DocumentNotFoundError('User not Found'));
  return data;
}

module.exports = {
  find,
  findAndSignIn,
  update,
  getUserFavourites,
  addUserFavourites,
  me,
  checkWallet,
  sendVerifyEmail,
  getUserByUsername,
};
