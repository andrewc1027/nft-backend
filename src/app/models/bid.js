const {ObjectId} = require('bson');
const mongoose = require('mongoose');
const paginate = require('mongoose-paginate-v2');
const softDelete = require('mongoose-delete');

const schema = new mongoose.Schema({
  listing: {type: ObjectId, ref: 'listings'},
  bidder: {
    name: {type: String},
    id: {type: ObjectId, ref: 'users'},
    address: {type: String},
  },
  price: {type: Number},
  floorDifference: {type: String},
  bidIndex: {type: String, required: true},
  status: {type: String, default: 'Submitted'},
  expireAt: {type: Date},
  createdAt: {type: Date},
});

schema.plugin(paginate);
schema.plugin(softDelete);
const bids = mongoose.model('bids', schema);

module.exports = bids;
