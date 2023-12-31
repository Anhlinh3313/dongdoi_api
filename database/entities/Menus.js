require('../database');
const mongoose = require('mongoose');
const { Schema } = mongoose;

let menuSchema = new Schema({
    menuName:{
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    menuSlug:{
        type: String,
        required: true,
        unique: true
    },
    menuIcon: {
        type: String
    },
    parent: {
        type: Schema.Types.ObjectId,
        ref: 'Menus',
        default: null
    },
    children: [{
        type: Object
    }],
    menuOrder: {
        type: Number,
        default: 0
    },
    createdTime: {
        type: Date,
        default: Date.now
    },
    updatedTime: {
        type: Date
    },
    isShow: {
        type: Boolean,
        default: true
    },
    category: {
        type: Schema.Types.ObjectId,
        ref: 'Categories'
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'Users'
    }
}, { versionKey: false });

menuSchema.index({'menuName': 'text'});

module.exports = mongoose.model('Menus', menuSchema)