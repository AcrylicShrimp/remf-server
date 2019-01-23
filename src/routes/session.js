
'use strict';

const express             = require('express');
const expressAsyncHandler = require('express-async-handler');
const validator           = require('validator');

const helper = require('./helper');
const logger = require('../logger');

const Session = require('../models/Session');
const User    = require('../models/User');

const router = express.Router();

router.post('/', expressAsyncHandler(async (req, res) => {
	const username      = String(req.body.username || '').trim();
	const password      = String(req.body.password || '');
	const firebaseToken = String(req.body.firebaseToken || '').trim();

	if (!validator.isAlphanumeric(username) ||
		!validator.isLength(username, { min: 4 }) ||
		!validator.isLength(password, { min: 4 }) ||
		validator.isEmpty(firebaseToken))
		return res.status(400).end();

	let user = await User.findOne({ username: username }, { _id: true, password: true, loginedAt: true });

	if (!user) {
		user = new User({
			username: username,
			password: helper.hashPassword(password)
		});

		user.firebaseToken = firebaseToken;
		user.loginedAt     = user.createdAt;
		await user.save();

		logger.notice(`A new user '${username}' is created from '${req.ip}'.`);
	}

	if (user.password !== helper.hashPassword(password))
		return res.status(401).end();

	let session = await Session.findOne({ user: user._id }, { _id: true });

	if (session)
		await session.remove();

	session = new Session({
		user: user._id,
		id  : helper.generateId()
	});

	session.usedAt = session.createdAt;
	await session.save();

	user.loginedAt = session.usedAt;
	await user.save();

	logger.notice(`A new session for user '${username}' is created from '${req.ip}'.`);

	res.status(201).json({
		sessionId: session.id
	});
}));

router.all('/', (_, res) => res.status(405).end());

router.delete('/:id', expressAsyncHandler(async (req, res) => {
	const id = String(req.params.id || '').trim();

	if (validator.isEmpty(id))
		return res.status(400).end();

	const session = await Session.findOneAndDelete({ id: id }).populate({
		path  : 'user',
		select: 'username'
	});

	if (!session)
		return res.status(404).end();

	logger.notice(`The session for user '${session.user.username}' is deleted from '${req.ip}'.`);

	return res.status(204).end();
}));

router.all('/:id', (_, res) => res.status(405).end());

module.exports = router;