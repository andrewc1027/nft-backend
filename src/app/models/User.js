const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const schema = new mongoose.Schema({
  username: {type: String, unique: true},
  email: {type: String, unique: true},
  bio: {type: String},
  address: {type: String, unique: true},
  createdAt: {type: Date},
  updatedAt: {type: Date},
  lastLoginAt: {type: Date},
});
schema.plugin(uniqueValidator);
const user = mongoose.model('user', schema);

module.exports = user;
