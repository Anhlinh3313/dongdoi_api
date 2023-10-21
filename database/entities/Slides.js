require('../database');
const mongoose = require('mongoose');
const { Schema } = mongoose;

let slideSchema = new Schema({
    link:{
        type: String,
        required: true,
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

slideSchema.index({'link': 'text'});

module.exports = mongoose.model('Slides', slideSchema)