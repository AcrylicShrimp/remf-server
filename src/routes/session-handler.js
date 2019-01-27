
'use strict';

const expressAsyncHandler = require('express-async-handler');
const validator           = require('validator');

const Session = require('../models/Session');

module.exports = expressAsyncHandler(async (req, res, next) => {
	const sessionId = String(req.query.sessionId || '').trim();

	if (validator.isEmpty(sessionId))
		return res.status(401).end();

	const session = await Session.findOne({ id: sessionId }).populate({ path: 'user' });

	if (!session)
		return res.status(401).end();

	session.usedAt = Date.now();
	await session.save();

	req.session = session;

	next();
});