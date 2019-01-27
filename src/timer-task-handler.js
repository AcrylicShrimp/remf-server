
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

			logger.notice(`${message.length} expired messages detected.`);

			message.forEach(async message => {
				await message.remove();

				//
				//	Important!
				//	We have to remove its contents together.
				//
				(await Content.find({ message: message._id }, { _id: true, id: true })).forEach(async content => {
					await content.remove();
					await new Promise((resolve, reject) => fs.unlink(path.join(storageSetting.storageRootPath, content.id), err => err ? reject(err) : resolve()));
				});
			});

			//
			//	First of all, every content cannot be expired, because the message will be expired earlier than its contents and deleted together.
			//	But when a message has been expired and deleted while the server is handling a new content of that,
			//	the uploaded content will be isolated from its deleted message. Now this content only occupying storage, never be accessed and deleted.
			//	Thus we have to check expired content and remove it.
			//
			const content = await Content.find({ createdAt: { $lte: Math.max(now - storageSetting.contentTTL, 0) } }, { _id: true, id: true });

			logger.notice(`${content.length} expired isolated contents detected.`);

			content.forEach(async content => {
				await content.remove();
				await new Promise((resolve, reject) => fs.unlink(path.join(storageSetting.storageRootPath, content.id), err => err ? reject(err) : resolve()));
			});
		} catch (err) {
			logger.error(`An error occurred while working on timer task :\n${err}`);
		}
	}, interval);
};