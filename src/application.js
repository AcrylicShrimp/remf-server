
'use strict';

const express = require('express');

const logger = require('./logger');

const application = express();

application.use((req, res, next) => {
	logger.info(`A new request ${req.method} ${req.originalUrl} received from ${req.ip}.`);
	next();
});

application.use(require('./middleware'));
application.use(require('./router'));

application.use((req, res, next) => {
	res.status(404).end();
});
application.use((err, req, res, next) => {
	logger.error(`An error has occurred while handling the request ${req.method} ${req.originalUrl} from ${req.ip} :\n${err}`);
	res.status(500).end();
});

module.exports = application;