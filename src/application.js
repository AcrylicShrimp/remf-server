
'use strict';

const express = require('express');

const requestHandler = require('./request-handler');

const application = express();

application.set('trust proxy', ['loopback', 'linklocal', 'uniquelocal']);

application.use(requestHandler.logger);

application.use(require('./middleware'));
application.use(require('./application-router'));

application.use(requestHandler.notFound);
application.use(requestHandler.internalError);

module.exports = application;