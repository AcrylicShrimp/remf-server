
'use strict';

const logger = require('./logger');

module.exports = {
	logger: (req, res, next) => {
		res.on('finish', () => logger.info(`The request ${req.method} ${req.originalUrl} received from ${req.ip} is handled with status code ${res.statusCode}.`));
		next();
	},
	notFound     : (req, res, next) => res.status(404).end(),
	internalError: (err, req, res, next) => {
		logger.error(`An error has occurred while handling the request ${req.method} ${req.originalUrl} received from ${req.ip} :\n${err}`);
		res.status(500).end();
	}
}