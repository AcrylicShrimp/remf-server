
'use strict';

const express = require('express');

const router = express.Router();

router.use('/message', require('./routes/message'));
router.use('/session', require('./routes/session'));

module.exports = router;