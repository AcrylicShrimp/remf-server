
'use strict';

const accepts             = require('accepts');
const express             = require('express');
const expressAsyncHandler = require('express-async-handler');
const validator           = require('validator');

const helper = require('./helper');
const logger = require('../logger');

const Session = require('../models/Session');
const User    = require('../models/User');

const router = express.Router();

router.post('/', expressAsyncHandler(async (req, res) => {
	if (!req.is('application/json'))
		return res.status(415).end();

	const accept = accepts(req);

	if (!accept.type(['application/json']))
		return res.status(406).end();

	const username      = String(req.body.username || '').trim();
	const password      = String(req.body.password || '');
	const firebaseToken = String(req.body.firebaseToken || '').trim();

	if (!validator.isAlphanumeric(username)
		|| !validator.isLength(username, { min: 4, max: 15 })
		|| !validator.isLength(password, { min: 4 })
		|| validator.isEmpty(firebaseToken))
		return res.status(400).end();

	let user = await User.findOne({ username: username }, { _id: true, password: true, loginedAt: true });

	if (!user) {
		user = new User({
			username: username,
			password: await helper.hashPassword(password)
		});

		user.firebaseToken = firebaseToken;
		user.loginedAt     = user.createdAt;
		await user.save();

		logger.notice(`A new user '${username}' is created.`);
	}

	if (!await helper.comparePassword(password, user.password))
		return res.status(401).end();

	let session = await Session.findOne({ user: user._id }, { _id: true });

	if (session)
		await session.remove();

	session = new Session({
		user: user._id,
		id  : await helper.generateId()
	});

	session.usedAt = session.createdAt;
	await session.save();

	user.loginedAt = session.usedAt;
	await user.save();

	logger.notice(`A new session '${session.id}' for user '${username}' is created.`);

	res.status(201).json({
		sessionId: session.id
	});
}));

router.all('/', (_, res) => res.status(405).end());

router.delete('/:sessionId', expressAsyncHandler(async (req, res) => {
	const sessionId = String(req.params.sessionId || '').trim();

	if (validator.isEmpty(sessionId))
		return res.status(400).end();

	const session = await Session.findOneAndDelete({ id: sessionId }).populate({
		path  : 'user',
		select: 'username'
	});

	if (!session)
		return res.status(404).end();

	logger.notice(`The session for user '${session.user.username}' is deleted.`);

	res.status(204).end();
}));

router.all('/:sessionId', (_, res) => res.status(405).end());

module.exports = router;