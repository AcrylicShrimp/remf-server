
'use strict';

const expressAsyncHandler = require('express-async-handler');
const validator           = require('validator');

const Session = require('../models/Session');

module.exports = expressAsyncHandler(async (req, res, next) => {
	if (validator.isEmpty(req.query.sessionId))
		return res.status(401).end();

	const session = await Session.findOne({ id: req.query.sessionId }).populate({ path: 'user' });

	if (!session)
		return res.status(401).end();

	session.usedAt = Date.now();
	await session.save();

	req.session = session;

	next();
});