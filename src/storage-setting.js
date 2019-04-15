
'use strict';

const path = require('path');

const config = require('../configs/config.json');

module.exports = {
	storageRootPath: config['storage-path'] || path.resolve(__dirname, '..', 'storage'),
	contentTTL     : 
		3			//days
		* 24 		//hours
		* 60		//minutes
		* 60		//seconds
		* 1000		//milliseconds
};