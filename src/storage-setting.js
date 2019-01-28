
'use strict';

const path = require('path');

module.exports = {
	storageRootPath: path.resolve(__dirname, '..', 'storage'),
	contentTTL     : 
		3			//days
		* 24 		//hours
		* 60		//minutes
		* 60		//seconds
		* 1000		//milliseconds
};