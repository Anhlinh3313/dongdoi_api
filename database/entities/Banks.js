require('../database');
const mongoose = require('mongoose');
const { Schema } = mongoose;

let bankSchema = new Schema({
    name:{
        type: String,
        required: true,
        unique: true
    },
    code:{
        type: String,
        required: true,
        unique: true
    },
    bin:{
        type: String,
        required: true,
        unique: true
    },
    logo:{
        type: String,
        required: true,
        unique: true
    },
    createdTime: {
        type: Date,
        default: Date.now
    },
    updatedTime: {
        type: Date
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'Users'
    }
}, { versionKey: false });

bankSchema.index({'code': 'text'});

module.exports = mongoose.model('Banks', bankSchema)