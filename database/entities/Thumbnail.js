require('../database');
const mongoose = require('mongoose');
const { Schema } = mongoose;

let ThumbnailSchema = new Schema({
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
    content: {
        type: String
    },
    image: {
        type: Array
    },
    menu: {
        type: Schema.Types.ObjectId,
        ref: 'Menus'
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'Users'
    },
    createdTime: {
        type: Date,
        default: Date.now
    },
    updatedTime: {
        type: Date
    }
}, { versionKey: false });

ThumbnailSchema.index({ 'title': 'text' });

module.exports = mongoose.model('Thumbnail', ThumbnailSchema)