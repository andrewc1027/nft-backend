const mongoose = require('mongoose');
const paginate = require('mongoose-paginate-v2');

const schema = new mongoose.Schema({
  name: {type: String, required: true, unique: true},
  description: {type: String},
  owner: {type: String, required: true},
  images: {type: [String]},
  featureImage: {type: String},
  bannerImage: {type: String},
  url: {type: String},
  royalties: {type: Number}, // in percentage
  contactAddress: {type: String}, // Royalties will go to this address,
  blockchain: {type: String},
  paymentTokens: {type: [String], required: true},
  price: {type: Number, required: true},
  tokenID: {type: Number, required: true},
  views: {type: Number},
});

schema.plugin(paginate);
const listing = mongoose.model('listings', schema);

module.exports = listing;
