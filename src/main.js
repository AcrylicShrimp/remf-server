
'use strict';

const http  = require('http');
const https = require('https');

const application = require('./application');
const httpServer  = http.createServer(application);
//const httpsServer = https...;

const logger = require('./logger');

logger.info('Setting up the server...');

const httpPort  = process.env.HTTP_PORT || 80;
const httpsPort = process.env.HTTPS_PORT || 443;

httpServer.listen(httpPort, () => {
	logger.info('HTTP server is up.');
});