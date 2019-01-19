
'use strict';

const express     = require('express');
const application = express();

const middleware = require('./middleware');
const router     = require('./router');
application.use(middleware);
application.use(router);

const logger = require('./logger');

application.use((req, res, next) => {
	res.status(404).end();
});
application.use((err, req, res, next) => {
	logger.error(`An error occurred while handling request : ${err}`);
	res.status(500).end();
});

module.exports = application;