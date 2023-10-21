require('../database');
const mongoose = require('mongoose');
const { Schema } = mongoose;

let bannerslideSchema = new Schema({
    link: {
        type: String,
        required: true,
    },
    createdTime: {
        type: Date,
        default: Date.now
    },
    menu: {
        type: Schema.Types.ObjectId,
        ref: 'Menus'
    },
    updatedTime: {
        type: Date
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'Users'
    }
}, { versionKey: false });

bannerslideSchema.index({ 'link': 'text' });

module.exports = mongoose.model('BannerSlides', bannerslideSchema)