const {ObjectId} = require('bson');
const mongoose = require('mongoose');
const paginate = require('mongoose-paginate-v2');

const schema = new mongoose.Schema({
  name: {type: String, required: true, unique: true},
  description: {type: String},
  logoImage: {type: String},
  owner: {type: String, required: true},
  // images: [nFTPhotos],
  featureImage: {type: String},
  bannerImage: {type: String},
  url: {type: String, unique: true},
  blockchain: {type: String},
  royalties: {type: String},
  payoutAddress: {type: String},
  paymentToken: {type: [String]},
  listingCount: {type: Number},

  geoLocation: {
    type: {type: String},
    coordinates: [Number],
  },
  density: {type: Number},
  population: {type: Number},
  timezone: {type: String},
  stateCode: {type: String},
  parent: {type: Boolean},
  city: {
    name: {type: String},
    url: {type: String},
    id: {type: ObjectId},
  },
  creator: {
    username: {type: String},
    id: {type: ObjectId},
  },
});

schema.plugin(paginate);
const collection = mongoose.model('collections', schema);

module.exports = collection;
