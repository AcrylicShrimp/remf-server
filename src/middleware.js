
'use strict';

const compression = require('compression');
const express     = require('express');
const helmet      = require('helmet');
const requestIp   = require('request-ip');

module.exports = [
	helmet(),
	compression(),
	requestIp.mw(),
	express.urlencoded({ extended: true }),
	express.json()
];