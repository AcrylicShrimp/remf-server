
'use strict';

const express             = require('express');
const expressAsyncHandler = require('express-async-handler');
const fs                  = require('fs');
const validator           = require('validator');

const fileHandler     = require('./file-handler');
const firebaseMessage = require('../firebase-message');
const helper          = require('./helper');
const logger          = require('../logger');
const messageHandler  = require('./message-handler');
const sessionHandler  = require('./session-handler');

const Content = require('../models/Content');
const Message = require('../models/Message');
const User    = require('../models/User');

const router = express.Router();

router.post('/', sessionHandler, expressAsyncHandler(async (req, res) => {
	const to           = String(req.body.to || '').trim();
	const title        = String(req.body.title || '').trim();
	const contentCount = String(req.body.contentCount || '').trim();

	if (!validator.matches(to, /(?:[a-zA-Z\d]{4,15}\n?){1,5}/) ||
		!validator.matches(title, /.*/) ||
		!validator.isInt(contentCount, { min: 1, max: 2048 }))
		return res.status(400).end();

	const usernameList = to.split('\n');

	if ((new Set(usernameList)).size !== usernameList.length)
		return res.status(400).end();

	const message = new Message({
		id  : helper.generateId(),
		from: req.session.user._id,
		to  : (await Promise.all(usernameList.map(async username => {
			const user = await User.findOne({ username: username }, { _id: true });
			return user && user._id;
		}))).filter(Boolean),
		title       : title || 'No title',
		contentCount: Number(contentCount)
	});
	await message.save();

	logger.notice(`A new message is created by user '${req.session.user.username}'.`);

	res.status(201).json({
		messageId: message.id
	});
}));

router.all('/', (_, res) => res.status(405).end());

router.get('/:messageId', sessionHandler, messageHandler.senderAndReceiver, expressAsyncHandler(async (req, res) => {
	let content = await Content.find({ message: req.message._id }, { id: true, order: true });

	if (content.length !== req.message.contentCount)
		return res.status(204).end();

	content = content.map(content => {
		return {
			id      : content.id,
			order   : content.order,
			type    : content.type,
			filename: content.filename,
			size    : content.size,
		};
	});

	return res.status(200).json(req.message.from.equals(req.session.user._id) ? {
		to          : req.message.to.map(to => to.username),
		contentCount: req.message.contentCount,
		createdAt   : req.message.createdAt,
		content     : content
	}
	: {
		from        : req.message.from.username,
		contentCount: req.message.contentCount,
		createdAt   : req.message.createdAt,
		content     : content
	});
}));

router.put('/:messageId', sessionHandler, messageHandler.senderOnly, fileHandler.single('file'), expressAsyncHandler(async (req, res) => {
	if (!req.file)
		return res.status(400).end();

	const order = String(req.body.order || '').trim();
	const type  = String(req.body.type || '').trim();

	if (!validator.isInt(order, { min: 0 }) ||
		!validator.isMimeType(type)) {
		await new Promise((resolve, reject) => fs.unlink(req.file.path, err => err ? reject(err) : resolve()));
		return res.status(400).end();
	}

	if (type !== 'text/plain' &&
		type !== 'image/gif' &&
		type !== 'image/jpeg' &&
		type !== 'image/png' &&
		type !== 'application/octet-stream') {
		await new Promise((resolve, reject) => fs.unlink(req.file.path, err => err ? reject(err) : resolve()));
		return res.status(415).end();
	}

	const contentCount = await Content.countDocuments({ message: req.message._id });

	if (contentCount >= req.message.contentCount ||
		await Content.countDocuments({ message: req.message._id, order: Number(order) })) {
		await new Promise((resolve, reject) => fs.unlink(req.file.path, err => err ? reject(err) : resolve()));
		return res.status(409).end();
	}

	const content = new Content({
		message : req.message._id,
		id      : req.file.filename,
		order   : Number(order),
		type    : type,
		filename: req.file.originalname,
		size    : req.file.size
	});
	await content.save();

	logger.notice(`The content of the message ${req.file.size} bytes '${type}' is uploaded.`);

	if (contentCount + 1 === req.message.contentCount) {
		await Promise.all(req.message.to.map(user => firebaseMessage(user, req.message.title, `The user '${req.message.from.username}' sent you .`)));
		res.status(204).end();
	} else
		res.status(100).end();
}));

router.all('/:messageId', (_, res) => res.status(405).end());

module.exports = router;