
'use strict';

const multer = require('multer');
const path   = require('path');

const helper         = require('./helper');
const storageSetting = require('../storage-setting');

module.exports = multer({
	storage: multer.diskStorage({
		destination: (req, file, cb) => cb(null, storageSetting.storageRootPath),
		filename   : (req, file, cb) => cb(null, helper.generateId())
	})
});