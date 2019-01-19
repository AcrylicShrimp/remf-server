
'use strict';

const express = require('express');
const router  = express.Router();

router.post('/', (req, res) => {
	res.status(200).end();
});

router.delete('/', (req, res) => {
	res.status(200).end();
});

router.all('/', (req, res) => {
	res.status(405).end();
});

module.exports = router;