const {ObjectId} = require('bson');
const mongoose = require('mongoose');
const paginate = require('mongoose-paginate-v2');
const listing = require('./listing');

const schema = new mongoose.Schema({
  from: {type: String, required: true},
  to: {type: String, required: true},
  date: {type: Date, required: true},
  price: {type: Number, required: true},
  quantity: {type: Number, required: true},
  event: {type: String, required: true},
  listingID: {type: ObjectId, required: true, ref: listing},
  remark: {type: String},
  tokenId: {type: Number, required: true},
});

schema.plugin(paginate);
const trading = mongoose.model('tradingHistories', schema);

module.exports = trading;
