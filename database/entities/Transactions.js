require('../database');
const mongoose = require('mongoose');
const { Schema } = mongoose;

let transactionSchema = new Schema({
    number:{
        type: String,
    },
    phone:{
        type: String,
    },
    money:{
        type: String,
    },
    type:{
        type: String,
    },
    gateway:{
        type: String,
    },
    txn_id:{
        type: String,
    },
    content:{
        type: String,
    },
    datetime:{
        type: String,
    },
}, { versionKey: false });

module.exports = mongoose.model('Transactions', transactionSchema)