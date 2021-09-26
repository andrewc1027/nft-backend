const {ObjectId} = require('bson');
const mongoose = require('mongoose');
const paginate = require('mongoose-paginate-v2');

const schema = new mongoose.Schema({
  name: {type: String, required: true},
  originalName: {type: String, required: true},
  location: {type: String, required: true},
  address: {type: String, required: true},
  description: {type: String, required: true},
  tags: {type: String}, // Comma Separated
  creator: {type: String, required: true},
  creatorID: {type: ObjectId, required: true},
  collections: {type: [String]},
  blockchain: {type: String},
  published: {type: Boolean, default: false},
  imagePath: {type: String, required: true},
  imageSize: {type: Number, required: true},
  rawImagePath: {type: String, required: true},
  rawImageSize: {type: Number, required: true},
});

schema.plugin(paginate);
const nFTPhotos = mongoose.model('nftphotos', schema);

module.exports = nFTPhotos;
