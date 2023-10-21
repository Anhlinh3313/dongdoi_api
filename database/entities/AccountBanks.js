require('../database');
const mongoose = require('mongoose');
const { Schema } = mongoose;

let accountBanksSchema = new Schema({
    accountName:{
        type: String,
        required: true,
    },
    accountNo:{
        type: String,
        required: true,
        unique: true
    },
    bank: {
        type: Schema.Types.ObjectId,
        ref: 'Banks',
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

accountBanksSchema.index({'accountName': 'text'});

module.exports = mongoose.model('AccountBanks', accountBanksSchema)