const {ObjectId} = require('bson');
const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const schema = new mongoose.Schema({
  username: {type: String, unique: true, required: true},
  email: {type: String, unique: true, required: true},
  bio: {type: String},
  walletAddress: {type: String, unique: true, required: true},
  createdAt: {type: Date, required: true},
  updatedAt: {type: Date},
  lastLoginAt: {type: Date},
  favourites: [ObjectId],
});
schema.plugin(uniqueValidator);
const user = mongoose.model('user', schema);

module.exports = user;
