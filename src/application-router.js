
'use strict';

const express = require('express');

const applicationRouter = express.Router();

applicationRouter.use('/content', require('./routes/content'));
applicationRouter.use('/message', require('./routes/message'));
applicationRouter.use('/session', require('./routes/session'));

module.exports = applicationRouter;