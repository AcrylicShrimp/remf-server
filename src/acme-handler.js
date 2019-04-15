
'use strict';

const greenLockExpress = require('greenlock-express');
const greenLockStoreFs = require('greenlock-store-fs');
const path             = require('path');

const config = require('../configs/config.json');

module.exports = greenLockExpress.create({
	version        : 'draft-11',
	server         : 'https://acme-v02.api.letsencrypt.org/directory',
	email          : config['acme-email'],
	approvedDomains: config['acme-domains'],
	configDir      : path.resolve(__dirname, '..', 'credentials'),
	store          : greenLockStoreFs,
	communityMember: false,
	agreeTos       : true,
	debug          : process.env.NODE_ENV !== 'production'
});