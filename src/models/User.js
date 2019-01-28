
'use strict';

const mongoose = require('mongoose');

const schema = new mongoose.Schema({
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
		required: true
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
});

module.exports = mongoose.model('User', schema);