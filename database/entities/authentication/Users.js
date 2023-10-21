require('../../database');
const mongoose = require('mongoose');

const { Schema } = mongoose;

let userSchema = new Schema({
    userName: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    fullName: {
        type: String,
        default: 'unknown'
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    phoneNumber: {
        type: String
    },
    createdTime: {
        type: Date,
        default: Date.now
    },
    updatedTime: {
        type: Date
    },
    role: {
        type: Schema.Types.ObjectId,
        ref: 'Roles'
    },
    activeStatus: {
        type: Number,
        default: 1
    },
    otp: {
        type: Number,
        default: 0
    }
}, { versionKey: false });

module.exports = mongoose.model('Users', userSchema)
