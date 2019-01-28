
'use strict';

const mongoose = require('mongoose');

const schema = new mongoose.Schema({
	message: {
		type    : mongoose.Schema.Types.ObjectId,
		ref     : 'Message',
		index   : true,
		required: true
	},
	id: {
		type    : String,
		index   : true,
		unique  : true,
		required: true,
		dropDups: true
	},
	order: {
		type    : Number,
		required: true
	},
	type: {
		type    : String,
		required: true
	},
	filename: {
		type    : String,
		required: true
	},
	size: {
		type    : Number,
		required: true
	},
	createdAt: {
		type    : Date,
		default : Date.now,
		index   : true,
		required: true
	}
});

module.exports = mongoose.model('Content', schema);