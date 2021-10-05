const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const schema = new mongoose.Schema({
  username: {type: String, unique: true, sparse: true},
  email: {type: String, unique: true},
  bio: {type: String},
  walletAddress: {type: String, unique: true, required: true},
  createdAt: {type: Date, required: true},
  updatedAt: {type: Date},
  lastLoginAt: {type: Date},
  notifications: {
    auctionExpiration: {type: Boolean, default: false},
    bidActivity: {type: Boolean, default: false},
    itemSold: {type: Boolean, default: false},
    newsLetter: {type: Boolean, default: false},
    outbid: {type: Boolean, default: false},
    ownedUpdate: {type: Boolean, default: false},
    priceChange: {type: Boolean, default: false},
    referralSuccessful: {type: Boolean, default: false},
    successfulPurchase: {type: Boolean, default: false},
  },
});
schema.plugin(uniqueValidator);
const user = mongoose.model('user', schema);

module.exports = user;
