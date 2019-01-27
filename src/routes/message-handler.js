
'use strict';

const expressAsyncHandler = require('express-async-handler');
const validator           = require('validator');

const Message = require('../models/Message');

module.exports = {
	senderOnly: expressAsyncHandler(async (req, res, next) => {
		const messageId = String(req.params.messageId || '').trim();

		if (validator.isEmpty(messageId))
			return res.status(400).end();

		const message = await Message.findOne({ id: messageId }).populate({ path: 'from' }).populate({ path: 'to' });

		if (!message)
			return res.status(404).end();

		if (!message.from._id.equals(req.session.user._id))
			return res.status(403).end();

		req.message = message;

		next();
	}),
	senderAndReceiver: expressAsyncHandler(async (req, res, next) => {
		const messageId = String(req.params.messageId || '').trim();

		if (validator.isEmpty(messageId))
			return res.status(400).end();

		const message = await Message.findOne({ id: messageId }).populate({ path: 'from' }).populate({ path: 'to' });

		if (!message)
			return res.status(404).end();

		if (!message.from._id.equals(req.session.user._id) && !message.to.some(to => to.equals(req.session.user._id)))
			return res.status(403).end();

		req.message = message;

		next();
	})
};