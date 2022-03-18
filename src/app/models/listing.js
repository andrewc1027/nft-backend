const {ObjectId} = require('bson');
const mongoose = require('mongoose');
const paginate = require('mongoose-paginate-v2');
const softDelete = require('mongoose-delete');
const nft = require('./nft');
const user = require('./user');

const schema = new mongoose.Schema({
  name: {type: String, required: true},
  description: {type: String},
  address: {type: String, required: true},
  creator: {type: ObjectId, ref: user, required: true},
  city: {
    ID: {type: ObjectId},
    name: {type: String},
    url: {type: String},
  },
  tags: {type: String},
  geoLocation: {
    type: {type: String},
    coordinates: [Number],
  },
  nfts: [{type: ObjectId, ref: nft}],
  thumbnail: {type: String},
  videoThumbnail: {type: String},
  assets: [{
    fileName: {type: String},
    path: {type: String},
  }],

  // Listing Related
  owner: {type: String}, // Creator are the initial owner
  copies: {type: Number, default: 1},
  copiesLeft: {type: Number},
  featureImage: {type: String},
  bannerImage: {type: String},
  royalties: {type: Number}, // in percentage
  contactAddress: {type: String}, // Royalties will go to this address,
  blockchain: {type: String},
  paymentTokens: {type: [String]},
  price: {type: Number}, // Price / Starting Price
  tokenID: {type: String}, //Deprecated
  tokenIds: {type: [Number]},
  views: {type: Number, default: 0},
  likes: {type: Number, default: 0},
  activeDate: {type: Date},
  buyerAddress: {type: String},
  resource: {type: String}, // Image / Video / Gif / 360
  link360: {type: String},
  sellMethod: {type: String}, // Fixed Price / Auction
  bid: {
    highest: {type: Number}, // Bid Amount
    highestBidder: {type: String}, // Bidder Address
    bidCount: {type: Number}, // Total Bid for this listing
    endDate: {type: Date},
    activeAuction: {type: Boolean},
  },
  isPublished: {type: Boolean, default: false},
  downloadLink: {type: String, select: false},
  //
  subscribers: {type: [ObjectId]},
  createdAt: {type: Date},
  updatedAt: {type: Date},
});
schema.index({'geoLocation': '2dsphere'});
schema.plugin(paginate);
schema.plugin(softDelete);
const listing = mongoose.model('listings', schema);

module.exports = listing;
