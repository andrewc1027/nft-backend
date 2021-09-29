const {ObjectId} = require('bson');
const mongoose = require('mongoose');
const paginate = require('mongoose-paginate-v2');

const schema = new mongoose.Schema({
  name: {type: String, required: true},
  description: {type: String, required: true},
  location: {type: String, required: true},
  address: {type: String, required: true},
  creator: {type: String, required: true},
  owner: {type: String, required: true}, // Creator are the initial owner
  copies: {type: Number, default: 1},
  imageID: {type: ObjectId, required: true, ref: 'nftPhotos'},
  collections: {type: [String]},
  featureImage: {type: String},
  bannerImage: {type: String},
  royalties: {type: Number}, // in percentage
  contactAddress: {type: String}, // Royalties will go to this address,
  blockchain: {type: String},
  paymentTokens: {type: [String], required: true},
  price: {type: Number, required: true},
  tokenID: {type: Number, required: true},
  views: {type: Number},
  likes: {type: Number},
  activeDate: {type: Date},
  buyerAddress: {type: String},
  // IPFS Related Schema
  cid: {type: String, required: true, unique: true, sparse: true},
  pinDate: {type: Date, required: true},
  pinSize: {type: Number, required: true},
});

schema.plugin(paginate);
const listing = mongoose.model('listings', schema);

module.exports = listing;
