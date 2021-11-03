const mongoose = require('mongoose');
const paginate = require('mongoose-paginate-v2');

const schema = new mongoose.Schema({
  listing: {
    name: {type: String},
    id: {type: ObjectId, ref: 'listings'},
  },
  bidder: {
    name: {type: String},
    id: {type: ObjectId, ref: 'users'},
  },
  price: {type: Number},
  createdAt: {type: Date},
});

schema.plugin(paginate);
const bids = mongoose.model('bids', schema);

module.exports = bids;
