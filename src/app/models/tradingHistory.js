const {ObjectId} = require('bson');
const mongoose = require('mongoose');
const paginate = require('mongoose-paginate-v2');

const schema = new mongoose.Schema({
  from: {type: String, required: true},
  to: {type: String, required: true},
  date: {type: Date, required: true},
  price: {type: Number, required: true},
  listingID: {type: ObjectId, required: true},
  remark: {type: String},
});

schema.plugin(paginate);
const trading = mongoose.model('tradingHistories', schema);

module.exports = trading;
