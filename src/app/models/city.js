const {ObjectId} = require('bson');
const mongoose = require('mongoose');
const paginate = require('mongoose-paginate-v2');
const softDelete = require('mongoose-delete');

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
  index: {type: Number, default: 999},
  logo: {type: String},
});

schema.plugin(paginate);
schema.plugin(softDelete);
const collection = mongoose.model('cities', schema);

module.exports = collection;
