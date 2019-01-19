
'use strict';

const crypto = require('crypto');

const uuid = require('uuid');

module.exports = {
	generateId  : () => crypto.createHash('sha256').update(uuid.v4() + uuid.v4()).digest('hex'),
	hashPassword: (password) => crypto.createHash('sha512').update(password + crypto.createHash('sha256').digest('hex')).digest('hex')
};