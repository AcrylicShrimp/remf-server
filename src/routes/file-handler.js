
'use strict';

const multer = require('multer');

const helper         = require('./helper');
const storageSetting = require('../storage-setting');

module.exports = multer({
	storage: multer.diskStorage({
		destination: (req, file, cb) => cb(null, storageSetting.storageRootPath),
		filename   : async (req, file, cb) => cb(null, await helper.generateId)
	})
});