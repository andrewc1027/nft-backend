const {ObjectId} = require('mongodb');
const mongoose = require('mongoose');
const softDelete = require('mongoose-delete');
const user = require("./user");
const schema = new mongoose.Schema({
    customNftID: {type: ObjectId, required: true},
    creator: {type: ObjectId, ref: user, required: true},
    type: {type: String, required: true},
    isAerial: {type: Boolean, required: true},
    object: {type: String, required: true},
    location: {type: String, required: true},
    details: {type: String},
    fulfilled: {type: Boolean, required: true},
    performer: {type: ObjectId, ref: user, required: true},
    createdAt: {type: Date},
    updatedAt: {type: Date}
});
schema.plugin(softDelete);
const customNft = mongoose.model('orders', schema);

module.exports = customNft;
