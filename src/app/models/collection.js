const mongoose = require('mongoose');
const paginate = require('mongoose-paginate-v2');

const schema = new mongoose.Schema({
  name: {type: String, required: true, unique: true},
  description: {type: String},
  logo: {type: String, required: true},
  owner: {type: String, required: true},
  images: {type: [String]},
});

schema.plugin(paginate);
const NFTPhotos = mongoose.model('collections', schema);

module.exports = NFTPhotos;
