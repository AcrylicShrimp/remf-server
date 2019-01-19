
'use strict';

const mongoose = require('mongoose');

module.exports = mongoose.model('user', new mongoose.Schema({
	username    : String,
	passwordHash: String,
}));