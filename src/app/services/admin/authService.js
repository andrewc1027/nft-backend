
require('dotenv').config();
const admin = require('../../models/admin/admin');
const bcrypt =require('bcrypt');
const Joi =require('joi');
const jwt = require('jsonwebtoken');
const {DocumentNotFoundError}= require('mongoose').Error;

/**
 * @param {object} data
 */
async function login(data) {
  const adm = await admin.findOne({email: data.email})
      .select('password lastLoginAt verified superAdmin');
  console.log(adm);
  if (adm) {
    console.log(data.password, adm.password);
    const valid = await bcrypt.compare(data.password, adm.password);
    if (valid) {
      const token = jwt.sign(
          {adm},
          process.env.JWT_SECRET,
          {expiresIn: process.env.JWT_EXPIRE});
      adm.lastLoginAt = Date.now();
      await adm.save();
      return token;
    } else {
      throw new Error('Invalid Password');
    }
  } else {
    throw new DocumentNotFoundError('Admin Not Found');
  }
}

/**
 * @param {Object} data
 */
async function register(data) {
  const schema = Joi.object({
    name: Joi.string().required(),
    password: Joi.string().required(),
    email: Joi.string().required(),
  });
  const {error} = schema.validate(data, {allowUnknown: true});
  if (error) {
    throw error;
  }
  const salt = await bcrypt.genSalt(10);
  const pwd = await bcrypt.hash(data.password, salt);
  return await admin.create({
    name: data.name,
    email: data.email,
    password: pwd,
    verified: true,
  });
}

/**
 * @param {Object} user
 * @param {String} newPassword
 */
async function changePassword(user, newPassword) {
  const admin = await admin.find({email: data.email});
  if (admin) {
    const valid = await bcrypt.compare(admin.password, data.password);
    if (valid) {
      const salt = await bcrypt.genSalt(10);
      const newPass = await bcrypt.hash(newPassword, salt);
      admin.password = newPass;
      await admin.save();
      return admin;
    } else {
      throw new Error('Invalid Password');
    }
  } else {
    throw new DocumentNotFoundError('Admin Not Found');
  }
}

module.exports = {
  login,
  register,
  changePassword,
};
