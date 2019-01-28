
'use strict';

const mongoose = require('mongoose');

module.exports = (host, port, database, username, password, callback) => {
	const url = `mongodb://${username && password ? `${username}:${password}@` : ''}${host}:${port || 27017}/${database}`;

	mongoose.connect(url, {
		autoIndex      : process.env.NODE_ENV !== 'production',
		useCreateIndex : true,
		useNewUrlParser: true,
	}, err => callback(err, url));
};