
'use strict';

const fs   = require('fs');
const path = require('path');

const logger         = require('./logger');
const storageSetting = require('./storage-setting');

const Content = require('./models/Content');
const Message = require('./models/Message');

module.exports = interval => {
	setInterval(async () => {
		try {
			logger.notice(`Invoking the timer task.`);

			const now     = Date.now();
			const message = await Message.find({ createdAt: { $lte: Math.max(now - storageSetting.contentTTL, 0) } }, { _id: true });

			logger.notice(`${message.length} expired message${message.length < 2 ? '' : 's'} detected.`);

			await Promise.all(message.map(message => message.remove()));
			await Promise.all(message.map(message => Content.find({ message: message._id }, { _id: true, id: true })
				.then(content => content.map(content => Promise.all([
					//
					//	NOTE:
					//	Important!
					//	We have to remove its contents together.
					//
					new Promise((resolve, reject) => fs.unlink(path.join(storageSetting.storageRootPath, content.id), err => err ? reject(err) : resolve())).catch(err => logger.warning(`Unable to remove the content file '${content.id}' :\n${err}`)),
					content.remove()
				])))));

			//
			//	NOTE:
			//	First of all, every content cannot be expired, because the message will be expired earlier than its contents and deleted together.
			//	But when a message has been expired and deleted while the server is handling a new content of that,
			//	the uploaded content will be isolated from its deleted message. Now this content only occupying storage, never be accessed and deleted.
			//	Thus we have to check expired content and remove it.
			//
			const content = await Content.find({ createdAt: { $lte: Math.max(now - storageSetting.contentTTL, 0) } }, { _id: true, id: true });

			logger.notice(`${content.length} expired isolated content${content.length < 2 ? '' : 's'} detected.`);

			await Promise.all(content.map(content => Promise.all([
				new Promise((resolve, reject) => fs.unlink(path.join(storageSetting.storageRootPath, content.id), err => err ? reject(err) : resolve())).catch(err => logger.warning(`Unable to remove the content file '${content.id}' :\n${err}`)),
				content.remove()
			])));
		} catch (err) {
			logger.error(`An error occurred while working on timer task :\n${err}`);
		}
	}, interval);
};