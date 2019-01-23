
'use strict';

const express = require('express');

const requestHandler = require('./request-handler');

const application = express();

application.use(requestHandler.logger);

application.use(require('./middleware'));
application.use(require('./router'));

application.use(requestHandler.notFound);
application.use(requestHandler.internalError);

module.exports = application;