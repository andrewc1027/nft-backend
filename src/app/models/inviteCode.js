const {ObjectId} = require('bson');
const mongoose = require('mongoose');
const users = require('./user');
const schema = new mongoose.Schema({
  code: {type: String, unique: true, required: true},
  user: {type: ObjectId, ref: users},
  invitedAt: {type: Date},
  registeredAt: {type: Date},
  createdAt: {type: Date},
  updatedAt: {type: Date},
  status: {type: String},
});
const inviteCodes = mongoose.model('inviteCodes', schema);

module.exports = inviteCodes;
