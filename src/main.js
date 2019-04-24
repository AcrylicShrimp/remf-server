
'use strict';

const http = require('http');

const config = require('../configs/config.json');

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

	const httpPort   = config['http-port'] || 8000;
	const httpServer = http.createServer(application);

	httpServer.listen(httpPort, () => {
		logger.notice(`The remf HTTP server is running on port ${httpPort}.`);
	});

	const timerTaskInterval = config['timer-task-interval'] || 3600000;
	timerTaskHandler(timerTaskInterval);

	logger.notice(`The timer task is running every ${timerTaskInterval}ms.`);
});