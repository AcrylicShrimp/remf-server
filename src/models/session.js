
'use strict';

const mongoose = require('mongoose');

module.exports = mongoose.model('session', new mongoose.Schema({
	username   : String,
	sessionHash: String
}));