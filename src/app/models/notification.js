const {ObjectId} = require('bson');
const mongoose = require('mongoose');
const paginate = require('mongoose-paginate-v2');
const user = require('./user');
const listing = require('./listing');

const schema = new mongoose.Schema({
  title: {type: String, required: true},
  event: {type: String, required: true},
  userID: {type: ObjectId, required: true, ref: user},
  listing: {type: ObjectId, required: true, ref: listing},
  createdAt: {type: Date},
  openedAt: {type: Date},
  opened: {type: Boolean, default: false},
});

schema.plugin(paginate);
const notification = mongoose.model('notifications', schema);

module.exports = notification;
