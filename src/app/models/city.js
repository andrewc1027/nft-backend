const {ObjectId} = require('bson');
const mongoose = require('mongoose');
const paginate = require('mongoose-paginate-v2');

const schema = new mongoose.Schema({
  name: {type: String, required: true, unique: true},
  description: {type: String},
  logoImage: {type: String},
  featureImage: {type: String},
  bannerImage: {type: String},
  url: {type: String, unique: true},
  listingCount: {type: Number},

  geoLocation: {
    type: {type: String},
    coordinates: [Number],
  },
  density: {type: Number},
  population: {type: Number},
  timezone: {type: String},
  stateCode: {type: String},
  city: {
    name: {type: String},
    url: {type: String},
    id: {type: ObjectId},
  },
});

schema.plugin(paginate);
const collection = mongoose.model('cities', schema);

module.exports = collection;
