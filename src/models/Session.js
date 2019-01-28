
'use strict';

const mongoose = require('mongoose');

const schema = new mongoose.Schema({
	user: {
		type    : mongoose.Schema.Types.ObjectId,
		ref     : 'User',
		index   : true,
		unique  : true,
		required: true,
		dropDups: true
	},
	id: {
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
	usedAt: {
		type    : Date,
		required: true,
		expires : '1h'
	}
});

module.exports = mongoose.model('Session', schema);