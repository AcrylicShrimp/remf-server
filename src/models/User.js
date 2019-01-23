
'use strict';

const mongoose = require('mongoose');

module.exports = mongoose.model('User', new mongoose.Schema({
	username: {
		type    : String,
		index   : true,
		unique  : true,
		required: true,
		dropDups: true
	},
	password: {
		type    : String,
		required: true
	},
	firebaseToken: {
		type    : String,
		index   : true,
		unique  : true,
		required: true,
		dropDups: true
	},
	createdAt: {
		type    : Date,
		default : Date.now,
		required: true
	},
	loginedAt: {
		type    : Date,
		required: false,
		expires : '7d'
	}
}));