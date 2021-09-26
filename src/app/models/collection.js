const mongoose = require('mongoose');
const paginate = require('mongoose-paginate-v2');

const schema = new mongoose.Schema({
  name: {type: String, required: true, unique: true},
  description: {type: String},
  logo: {type: String, required: true},
  owner: {type: String, required: true},
  // images: [nFTPhotos],
  featureImage: {type: String},
  bannerImage: {type: String},
  url: {type: String},
  royalties: {type: Number}, // in percentage
  payoutWalletAddress: {type: String}, // Royalties will go to this address,
  blockchain: {type: String},
  paymentTokens: {type: [String], required: true},
});

schema.plugin(paginate);
const collection = mongoose.model('collections', schema);

module.exports = collection;
