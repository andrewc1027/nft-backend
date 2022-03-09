const {ObjectId} = require('mongodb');
const mongoose = require('mongoose');
const softDelete = require('mongoose-delete');
const schema = new mongoose.Schema({
  listingID: {type: ObjectId, required: true, ref: 'listings'},
  createdAt: {type: Date},
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
  },
});
schema.plugin(softDelete);
const listing = mongoose.model('nfts', schema);

module.exports = listing;
