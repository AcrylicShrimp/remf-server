
'use strict';

const greenLockExpress = require('greenlock-express');
const path             = require('path');

const acmeConfig = require('../configs/acme-config.json');

module.exports = greenLockExpress.create({
	version        : 'draft-11',
	server         : 'https://acme-v02.api.letsencrypt.org/directory',
	email          : acmeConfig.email,
	approvedDomains: acmeConfig.domains,
	configDir      : path.resolve(__dirname, '..', 'credencials'),
	communityMember: false,
	agreeTos       : true,
	debug          : false
});