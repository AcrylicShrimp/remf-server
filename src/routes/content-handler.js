
'use strict';

const expressAsyncHandler = require('express-async-handler');
const validator           = require('validator');

const Content = require('../models/Content');

module.exports = expressAsyncHandler(async (req, res, next) => {
	const contentId = String(req.params.contentId || '').trim();

	if (validator.isEmpty(contentId))
		return res.status(400).end();

	const content = await Content.findOne({ id: contentId }).populate({
		path    : 'message',
		populate: [{
			path: 'from'
		}, {
			path: 'to'
		}]
	});

	if (!content || !content.message)
		return res.status(404).end();

	if (!content.message.from._id.equals(req.session.user._id) && !content.message.to.some(to => to.equals(req.session.user._id)))
		return res.status(403).end();

	req.content = content;

	next();
});