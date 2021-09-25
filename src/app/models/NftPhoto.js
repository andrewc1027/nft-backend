const {ObjectId} = require('bson');
const mongoose = require('mongoose');
const paginate = require('mongoose-paginate-v2');

const schema = new mongoose.Schema({
  name: {type: String, required: true},
  originalName: {type: String, required: true},
  location: {type: String, required: true},
  address: {type: String, required: true},
  description: {type: String},
  tags: {type: String}, // Comma Separated
  originalOwner: {type: String, required: true},
  originalOwnerID: {type: ObjectId, required: true},
  collections: {type: [String]},
  currentOwner: {type: String},
  blockchain: {type: String},
  cid: {type: String, unique: true, sparse: true},
  pinDate: {type: Date},
  pinSize: {type: Number},
  size: {type: Number},
});

schema.plugin(paginate);
const nFTPhotos = mongoose.model('nftphotos', schema);

module.exports = nFTPhotos;
