
'use strict';

const accepts             = require('accepts');
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
	if (!req.is('application/json'))
		return res.status(415).end();

	const accept = accepts(req);

	if (!accept.type(['application/json']))
		return res.status(406).end();

	const to           = String(req.body.to || '').trim();
	const title        = String(req.body.title || '').trim();
	const contentCount = String(req.body.contentCount || '').trim();

	if (!validator.matches(to, /^(?:(?:[a-zA-Z\d]{4,15})(?:\n[a-zA-Z\d]{4,15}){0,49})?$/)
		|| !validator.matches(title, /^.*$/)
		|| !validator.isInt(contentCount, { min: 1, max: 2048 }))
		return res.status(400).end();

	const usernameList = to.split('\n');

	if (!usernameList.length)
		usernameList.push(req.session.user.username);

	if ((new Set(usernameList)).size !== usernameList.length)
		return res.status(400).end();

	const message = new Message({
		id  : await helper.generateId(),
		from: req.session.user._id,
		to  : (await Promise.all(usernameList.map(async username => {
			const user = await User.findOne({ username: username }, { _id: true });
			return user && user._id;
		}))).filter(Boolean),
		title       : title || 'No title',
		contentCount: Number(contentCount)
	});
	await message.save();

	logger.notice(`A new message '${message.id}' is created by user '${req.session.user.username}'.`);

	res.status(201).json({
		messageId: message.id
	});
}));

router.all('/', (_, res) => res.status(405).end());

router.get('/sent', sessionHandler, expressAsyncHandler(async (req, res) => {
	const accept = accepts(req);

	if (!accept.type(['application/json']))
		return res.status(406).end();

	const skip  = String(req.query.skip || '0').trim();
	const limit = String(req.query.limit || '20').trim();

	if (!validator.isInt(skip, { min: 0 })
		|| !validator.isInt(limit, { min: 1, max: 100 }))
		return res.status(400).end();

	let message = await Message.find({ from: req.session.user._id, sent: true }, { _id: false, id: true, from: true, to: true, title: true, contentCount: true, sentAt: true })
									.sort({ sentAt: -1 })
									.skip(Number(skip))
									.limit(Number(limit))
									.populate({
										path  : 'from',
										select: '-_id username'
									})
									.populate({
										path  : 'to',
										select: '-_id username'
									});

	message = message.map(message => message.toObject());
	message.forEach(message => message.from = message.from.username);
	message.forEach(message => message.to = message.to.map(user => user.username));

	res.status(200).json(message);
}));

router.all('/sent', (_, res) => res.status(405).end());

router.get('/received', sessionHandler, expressAsyncHandler(async (req, res) => {
	const accept = accepts(req);

	if (!accept.type(['application/json']))
		return res.status(406).end();

	const skip  = String(req.query.skip || '0').trim();
	const limit = String(req.query.limit || '20').trim();

	if (!validator.isInt(skip, { min: 0 })
		|| !validator.isInt(limit, { min: 1, max: 100 }))
		return res.status(400).end();

	let message = await Message.find({ to: req.session.user._id, sent: true }, { _id: false, id: true, from: true, title: true, contentCount: true, sentAt: true })
									.sort({ sentAt: -1 })
									.skip(Number(skip))
									.limit(Number(limit))
									.populate({
										path  : 'from',
										select: '-_id username'
									});

	message = message.map(message => message.toObject());
	message.forEach(message => message.from = message.from.username);
	message.forEach(message => message.to = [ req.session.user.username ]);

	res.status(200).json(message);
}));

router.all('/received', (_, res) => res.status(405).end());

router.get('/:messageId', sessionHandler, messageHandler.senderAndReceiver, expressAsyncHandler(async (req, res) => {
	const accept = accepts(req);

	if (!accept.type(['application/json']))
		return res.status(406).end();

	if (!req.message.sent)
		return res.status(204).end();

	const content = await Content.find({ message: req.message._id }, { _id: false, id: true, order: true, type: true, filename: true, size: true }).sort({ order: 1 });

	return res.status(200).json({
		from        : req.message.from.username,
		to          : req.message.to.map(user => user.username),
		title       : req.message.title,
		contentCount: req.message.contentCount,
		sentAt      : req.message.sentAt,
		content     : content
	});
}));

router.put('/:messageId', sessionHandler, messageHandler.senderOnly, fileHandler.single('file'), expressAsyncHandler(async (req, res) => {
	//
	//	NOTE:
	//	Because multer only handles 'multipart/form-data',
	//	we can skip unlinking received file.
	//
	if (!req.is('multipart/form-data'))
		return res.status(415).end();

	if (!req.file)
		return res.status(400).end();

	try {
		const order = String(req.body.order || '').trim();
		const type  = String(req.body.type || '').trim();

		if (!validator.isInt(order, { min: 0 })
			|| !validator.isMimeType(type))
			throw 400;

		if (type !== 'text/plain'
			&& type !== 'image/gif'
			&& type !== 'image/jpeg'
			&& type !== 'image/png'
			&& type !== 'application/octet-stream')
			throw 415;

		if (req.message.sent)
			throw 409;

		const content = new Content({
			message : req.message._id,
			id      : req.file.filename,
			order   : Number(order),
			type    : type,
			filename: req.file.originalname,
			size    : req.file.size
		});
		await content.save();

		const contentCount = await Content.countDocuments({ message: req.message._id });

		logger.notice(`The ${req.file.size} byte${req.file.size < 2 ? '' : 's'} '${type}' content '${content.id}' of the message '${req.message.id}' was uploaded, now ${contentCount} out of ${req.message.contentCount} content${req.message.contentCount < 2 ? '' : 's'} ready.`);

		if (contentCount < req.message.contentCount)
			return res.status(100).end();

		req.message.sent   = true;
		req.message.sentAt = Date.now();
		await req.message.save();

		if (req.message.contentCount < contentCount) {
			logger.warning(`The message '${req.message.id}' is overfilled. Expanding.`);

			req.message.contentCount = contentCount;
			await req.message.save();
		}

		logger.notice(`The message '${req.message.id}' is now fulfilled, notifying the ${req.message.to.length} recipients.`);

		await Promise.all(req.message.to.map(user => firebaseMessage(user, `'${req.message.from.username}' sent you ${req.message.contentCount} file${req.message.contentCount < 2 ? '' : 's'}.`, req.message.title)));
		res.status(204).end();
	} catch (err) {
		await new Promise((resolve, reject) => fs.unlink(req.file.path, err => err ? reject(err) : resolve()));

		if (Number.isInteger(err))
			return res.status(err).end();

		//
		//	Pass the error to the default error handler.
		//
		throw err;
	}
}));

router.all('/:messageId', (_, res) => res.status(405).end());

module.exports = router;