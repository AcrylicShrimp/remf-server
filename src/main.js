
'use strict';

const http = require('http');

const application = require('./application');
const database    = require('./database');
const logger      = require('./logger');

logger.notice(`The Refm server is starting up on ${process.env.NODE_ENV} mode.`);

const databaseHost = 'localhost';

database(databaseHost, null, 'remf', null, null, (err, url) => {
	if (err) {
		logger.emerg(`Failed to connect to the database at ${url} :\n${err}`);
		return;
	}

	logger.notice(`Successfully connected to the database at ${url}.`);

	const httpPort   = process.env.PORT || 80;
	const httpServer = http.createServer(application);

	httpServer.listen(httpPort, () => {
		logger.notice(`The HTTP server is running on port ${httpPort}.`);
	});
});