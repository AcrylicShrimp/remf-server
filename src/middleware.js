
'use strict';

const bodyParser  = require('body-parser');
const compression = require('compression');
const helmet      = require('helmet');
const requestIp   = require('request-ip');

module.exports = [
	helmet(),
	compression(),
	bodyParser.urlencoded({ extended: true }),
	bodyParser.json(),
	requestIp.mw()
];