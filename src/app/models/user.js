const {ObjectId} = require('bson');
const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const schema = new mongoose.Schema({
  username: {
    type: String,
    unique: true,
    sparse: true,
    uniqueCaseInsensitive: true,
  },
  email: {
    type: String,
    unique: true,
    sparse: true,
    uniqueCaseInsensitive: true},
  bio: {type: String},
  walletAddress: {type: String, unique: true, required: true},
  createdAt: {type: Date, required: true},
  updatedAt: {type: Date},
  lastLoginAt: {type: Date},
  logoImage: {type: String},
  bannerImage: {type: String},
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
  favorites: [ObjectId],
  invited: {type: Boolean, default: false},
  invitedAt: {type: Date},
  verified: {type: Boolean, default: false},
});
schema.plugin(uniqueValidator, {message: '{PATH}AlreadyExists'});
const user = mongoose.model('user', schema);

module.exports = user;
