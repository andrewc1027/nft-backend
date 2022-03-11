const {ObjectId} = require('mongodb');
const mongoose = require('mongoose');
const softDelete = require('mongoose-delete');
const user = require("./user");
const paginate = require("mongoose-paginate-v2");
const schema = new mongoose.Schema({
    creator: {type: ObjectId, ref: user, required: true},
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
