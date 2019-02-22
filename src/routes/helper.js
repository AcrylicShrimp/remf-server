
'use strict';

const bcrypt = require('bcrypt');
const crypto = require('crypto');

module.exports = {
	generateId     : () => new Promise((resolve, reject) => {
		crypto.randomBytes(256, (err, buffer) => {
			err ? reject(err): resolve(crypto.createHash('sha256').update(buffer).digest('hex'));
		});
	}),
	hashPassword   : password => bcrypt.hash(password, 15),
	comparePassword: (password, hash) => bcrypt.compare(password, hash)
};