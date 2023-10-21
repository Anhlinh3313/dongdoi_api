require('../database');
const mongoose = require('mongoose');
const { Schema } = mongoose;

let postSchema = new Schema({
    title: {
        type: String,
        required: true,
        unique: true
    },
    slug: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String,
        required: true
    },
    thumb: {
        type: String
    },
    content: {
        type: String
    },
    menu: {
        type: Schema.Types.ObjectId,
        ref: 'Menus'
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'Users'
    },
    highlight: { type: Boolean, default: false },
    numberOfReader: {
        type: Number,
        default: 0
    },
    status: {
        type: Number,
        default: 1
    },
    createdTime: {
        type: Date,
        default: Date.now
    },
    Communication: {
        type: String
    },
    updatedTime: {
        type: Date
    }
}, { versionKey: false });

postSchema.index({ 'title': 'text' });

module.exports = mongoose.model('Posts', postSchema)