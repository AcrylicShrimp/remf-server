
'use strict';

const crypto = require('crypto');
const sha256 = crypto.createHash('sha256');
const uuid   = require('uuid');

const express = require('express');
const router  = express.Router();

const Session = require('../models/session');
const User    = require('../models/user');

const logger = require('../logger');

router.post('/:username', (req, res) => {
	if (!/\S{3,15}/g.test(req.params.username)) {
		res.status(400).end();
		return;
	}

	if (!req.body.password) {
		res.status(400).end();
		return;
	}

	User.findOne({ username: req.params.username }, { _id: false, username: true, passwordHash: true }, (err, user) => {
		if (err) {
			logger.error(`An database error occurred while handling request : ${err}`);
			res.status(500).end();
			return;
		}

		const passwordHash = sha256.update(req.body.password).digest('hex');

		if (!user) {
			user              = new User();
			user.username     = req.params.username;
			user.passwordHash = passwordHash;

			user.save(err => {
				if (err) {
					logger.error(`An database error occurred while handling request : ${err}`);
					res.status(500).end();
					return;
				}

				logger.info(`A new user has been created : ${user}`);

				const session             = new Session();
				      session.username    = user.username;
				      session.sessionHash = sha256.update(uuid.v4()).digest('hex');

				session.save(err => {
					if (err) {
						logger.error(`An database error occurred while handling request : ${err}`);
						res.status(500).end();
						return;
					}

					logger.info(`A new session has been created : ${session}`);

					res.status(200).json({
						sessionHash: session.sessionHash
					});
				});
			});
			return;
		}

		if (user.passwordHash !== passwordHash) {
			res.status(401).end();
			return;
		}

		const session             = new Session();
		      session.username    = user.username;
		      session.sessionHash = sha256.update(uuid.v4()).digest('hex');

		session.save(err => {
			if (err) {
				logger.error(`An database error occurred while handling request : ${err}`);
				res.status(500).end();
				return;
			}

			logger.info(`A new session has been created : ${session}`);

			res.status(200).json({
				sessionHash: session.sessionHash
			});
		});
	});
});

router.delete('/:username', (req, res) => {
	if (!req.body.sessionHash) {
		res.status(400).end();
		return;
	}

	Session.findOneAndRemove({ username: req.params.username, sessionHash: req.body.sessionHash }, (err, session) => {
		if (err) {
			logger.error(`An database error occurred while handling request : ${err}`);
			res.status(500).end();
			return;
		}

		if (!session) {
			res.status(401).end();
			return;
		}

		res.status(200).end();
	});
});

router.all('/', (req, res) => {
	res.status(405).end();
});

module.exports = router;