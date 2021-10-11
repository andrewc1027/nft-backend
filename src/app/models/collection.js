const mongoose = require('mongoose');
const paginate = require('mongoose-paginate-v2');

const schema = new mongoose.Schema({
  name: {type: String, required: true, unique: true},
  description: {type: String},
  logoImage: {type: String, required: true},
  owner: {type: String, required: true},
  // images: [nFTPhotos],
  featureImage: {type: String},
  bannerImage: {type: String},
  url: {type: String},
  blockchain: {type: String},
  royalties: {type: String},
  payoutAddress: {type: String},
  paymentToken: {type: [String]},
  listingCount: {type: Number},
});

schema.plugin(paginate);
const collection = mongoose.model('collections', schema);

module.exports = collection;
