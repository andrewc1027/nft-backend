const {ObjectId} = require('bson');
const mongoose = require('mongoose');
const users = require('./user');
const paginate = require('mongoose-paginate-v2');
const schema = new mongoose.Schema({
  code: {type: String, unique: true, required: true},
  user: {type: ObjectId, ref: users},
  userEmail: {type: String, required: true},
  invitedAt: {type: Date},
  registeredAt: {type: Date},
  createdAt: {type: Date},
  updatedAt: {type: Date},
  status: {type: String},
});

schema.plugin(paginate);
const inviteCodes = mongoose.model('inviteCodes', schema);

module.exports = inviteCodes;
