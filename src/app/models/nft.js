const {ObjectId} = require('mongodb');
const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  listingID: {type: ObjectId, required: true, ref: 'listings'},
  // IPFS Related Schema
  ipfs: {
    file: {
      cid: {type: String},
      pinDate: {type: Date},
      pinSize: {type: Number},
      isDuplicate: {type: Boolean},
      originalName: {type: String, required: true},
      path: {type: String},
    },
    raw: {
      originalName: {type: String},
      cid: {type: String},
      pinDate: {type: Date},
      pinSize: {type: Number},
      isDuplicate: {type: Boolean},
      path: {type: String},
    },
  },
});
const listing = mongoose.model('nfts', schema);

module.exports = listing;
