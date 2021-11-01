const mongoose = require('mongoose');
const paginate = require('mongoose-paginate-v2');

const schema = new mongoose.Schema({
  name: {type: String, required: true, unique: true},
  description: {type: String},
  nextRunAt: {type: Date},
});

schema.plugin(paginate);
const jobs = mongoose.model('jobs', schema);

module.exports = jobs;
