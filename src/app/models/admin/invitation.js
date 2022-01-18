const {ObjectId} = require('bson');
const mongoose = require('mongoose');
const users = require('./../user');
const paginate = require('mongoose-paginate-v2');
const schema = new mongoose.Schema({
  hash: {type: String, unique: true, required: true},
  username: {type: String},
  email: {type: String, required: true},
  invitedAt: {type: Date},
  registeredAt: {type: Date},
  createdAt: {type: Date},
  updatedAt: {type: Date},
  status: {type: String},
  type: {type: String},
});

schema.plugin(paginate);
const verifications = mongoose.model('hashVerifications', schema);

module.exports = verifications;
