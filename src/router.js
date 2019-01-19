
'use strict';

const express = require('express');
const router  = express.Router();

const message = require('./routes/message');
const session = require('./routes/session');
router.use('/message', message);
router.use('/session', session);

module.exports = router;