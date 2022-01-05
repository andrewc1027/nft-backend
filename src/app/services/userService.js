
require('dotenv').config();
const user = require('../models/user');
const inviteCode = require('../models/inviteCode');
const jwt = require('jsonwebtoken');
const s3 = require('../config/s3');
const fs = require('fs');
const {PutObjectCommand} = require('@aws-sdk/client-s3');

/**
 * @param {String} address
 * @param {Object} query
 */
async function findAndSignIn(address, query) {
  let signedUser = {};
  const exUser = await user.findOne({walletAddress: address});
  if (!exUser) {
    signedUser = await register(address, query.invite);
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
 * @param {String} id
 */
async function find(id) {
  const data = await user.findById(id).orFail(
      () => Error('User not Found'));
  return data;
}

/**
 * @param {String} self
 */
async function me(self) {
  const data = await user.findById(self._id).orFail(
      () => Error('User not Found'));
  return data;
}

/**
 * @param {String} address
 * @param {String} invite
 */
async function register(address, invite) {
  await user.create({
    walletAddress: address,
    createdAt: Date.now(),
  });
  await inviteCode.findOneAndUpdate({inviteCode: invite},
      {registeredAt: Date.now()});
  const data = await user.findOne({walletAddress: address});
  return data;
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
  me,
};
