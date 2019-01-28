
'use strict';

const http          = require('http');
const https         = require('https');
const redirectHttps = require('redirect-https');

const acmeHandler      = require('./acme-handler');
const application      = require('./application');
const database         = require('./database');
const logger           = require('./logger');
const timerTaskHandler = require('./timer-task-handler');

logger.notice(`The refm server is starting up on ${process.env.NODE_ENV} mode.`);

const databaseHost = 'localhost';

database(databaseHost, null, 'remf', null, null, (err, url) => {
	if (err) {
		logger.emerg(`Failed to connect to the database at ${url} :\n${err}`);
		return;
	}

	logger.notice(`Successfully connected to the database at ${url}.`);

	const httpPort  = process.env.HTTP_PORT || 80;
	const httpsPort = process.env.HTTPS_PORT || 443;

	const httpServer  = http.createServer(acmeHandler.middleware(redirectHttps({ port: httpsPort })));
	const httpsServer = https.createServer(acmeHandler.tlsOptions, application);

	httpServer.listen(httpPort, () => {
		logger.notice(`The HTTP server is running on port ${httpPort}.`);
	});
	httpsServer.listen(httpsPort, () => {
		logger.notice(`The HTTPS server is running on port ${httpsPort}.`);
	});

	const timerTaskInterval = process.env.TIMER_TASK_INTERVAL || 60 * 60 * 1000;
	timerTaskHandler(timerTaskInterval);

	logger.notice(`The timer task is running every ${timerTaskInterval}ms.`);
});