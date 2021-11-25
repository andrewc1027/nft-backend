const {ObjectId} = require('mongodb');
const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  listingID: {type: ObjectId, required: true, ref: 'listings'},
  originalName: {type: String, required: true},
  rawName: {type: String, required: true},
  filePath: {type: String},
  rawPath: {type: String},
  thumbnail: {type: String},
  // IPFS Related Schema
  ipfs: {
    nft: {
      cid: {type: String},
      pinDate: {type: Date},
      pinSize: {type: Number},
      isDuplicate: {type: Boolean},
    },
    raw: {
      cid: {type: String},
      pinDate: {type: Date},
      pinSize: {type: Number},
      isDuplicate: {type: Boolean},
    },
  },
});
const listing = mongoose.model('nfts', schema);

module.exports = listing;
