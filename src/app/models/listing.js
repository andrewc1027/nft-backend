const {ObjectId} = require('bson');
const mongoose = require('mongoose');
const paginate = require('mongoose-paginate-v2');

const schema = new mongoose.Schema({
  name: {type: String, required: true},
  description: {type: String},
  location: {type: String, required: true},
  address: {type: String, required: true},
  creator: {
    name: {type: String},
    ID: {type: ObjectId, required: true},
  },
  collections: {type: [String]},
  tags: {type: [String]},
  geoLocation: {
    type: {type: String},
    coordinates: [Number],
  },
  fileOriginalName: {type: String, required: true},
  filePath: {type: String, required: true},

  // Listing Related
  owner: {type: String}, // Creator are the initial owner
  copies: {type: Number, default: 1},
  featureImage: {type: String},
  bannerImage: {type: String},
  royalties: {type: Number}, // in percentage
  contactAddress: {type: String}, // Royalties will go to this address,
  blockchain: {type: String},
  paymentTokens: {type: [String]},
  price: {type: Number},
  tokenID: {type: Number},
  views: {type: Number},
  likes: {type: Number},
  activeDate: {type: Date},
  buyerAddress: {type: String},

  // IPFS Related Schema
  ipfs: {
    cid: {type: String},
    pinDate: {type: Date},
    pinSize: {type: Number},
    isDuplicate: {type: Boolean},
  },
});

schema.plugin(paginate);
const listing = mongoose.model('listings', schema);

module.exports = listing;
