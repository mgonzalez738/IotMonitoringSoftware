const mongoose = require('mongoose');

const Schema = mongoose.Schema;

/** Tags schema for all devices and gateways */
const TagsSchema = new Schema({ 
    Description: { type: String },
    SerialNumber: { type: String },
    Latitude: { type: Number },
    Longitude: { type: Number }
},{ _id : false });

exports.TagsSchema = TagsSchema;