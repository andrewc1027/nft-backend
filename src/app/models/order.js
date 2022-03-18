const mongoose = require('mongoose');
const softDelete = require('mongoose-delete');
const paginate = require("mongoose-paginate-v2");
const schema = new mongoose.Schema({
    type: {type: String, required: true},
    isAerial: {type: Boolean, required: true},
    object: {type: String, required: true},
    location: {type: String, required: true},
    details: {type: String},
    contactMethod: {type: String, required: true},
    contactInfo: {type: String, required: true},
    fulfilled: {type: Boolean},
    performer: {type: String},
    createdAt: {type: Date},
    updatedAt: {type: Date}
});
schema.plugin(paginate);
schema.plugin(softDelete);
const order = mongoose.model('orders', schema);

module.exports = order;
