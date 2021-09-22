const {ObjectId} = require('bson');
const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  name: {type: String, required: true, unique: true},
  originalName: {type: String},
  location: {type: String},
  address: {type: String},
  description: {type: String},
  tags: {type: String}, // Comma Separated
  originalOwner: {type: String, required: true},
  originalOwnerID: {type: ObjectId, required: true},
  currentOwner: {type: String},
  blockchain: {type: String},
  cid: {type: String, required: true, unique: true},
  size: {type: Number},
});
const NFTPhotos = mongoose.model('nftphotos', schema);

module.exports = NFTPhotos;
