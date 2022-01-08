const mongoose = require('mongoose');
const paginate = require('mongoose-paginate-v2');
const softDelete = require('mongoose-delete');

const schema = new mongoose.Schema({
  name: {type: String, required: true, unique: true},
  email: {type: String, required: true, unique: true},
  password: {type: String, required: true, select: false},
  verified: {type: Boolean},
  createdAt: {type: Date},
  lastLoginAt: {type: Date},
});

schema.plugin(paginate);
schema.plugin(softDelete);
const bids = mongoose.model('admins', schema);

module.exports = bids;
