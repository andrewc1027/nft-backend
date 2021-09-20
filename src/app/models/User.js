const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  username: String,
  email: String,
  bio: String,
  address: String,
  createdAt: Date,
  updatedAt: Date,
  lastLoginAt: Date,
});
const NFTPhotos = mongoose.model('user', schema);

module.exports = NFTPhotos;
