
'use strict';

const Session = require('../models/session');
const User    = require('../models/user');

const logger = require('../logger');

module.exports = (req, res, next) => {
	if (!req.query.sessionHash) {
		res.status(401).end();
		return;
	}

	Session.findOne({ sessionHash: req.query.sessionHash }, (err, session) => {
		if (err) {
			logger.error(`An database error occurred while handling request : ${err}`);
			res.status(500).end();
			return;
		}

		if (!session) {
			res.status(401).end();
			return;
		}

		User.findOne({ username: session.username }, (err, user) => {
			if (err) {
				logger.error(`An database error occurred while handling request : ${err}`);
				res.status(500).end();
				return;
			}

			if (!user) {
				logger.warn(`Wrong session ${session} detected.`);
				res.status(401).end();
				return;
			}

			logger.info(`A valid session ${session} is being used by a client from ${req.clientIp}.`);
			next();
		});
	});
};