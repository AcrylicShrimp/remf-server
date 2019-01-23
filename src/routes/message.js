
'use strict';

const express             = require('express');
const expressAsyncHandler = require('express-async-handler');

const router = express.Router();

const firebaseAdmin = require('../firebase-admin');

router.post('/', expressAsyncHandler(async (req, res) => {
	await firebaseAdmin();
	res.status(200).end();
}));

router.delete('/', (req, res) => {
	res.status(200).end();
});

router.all('/', (req, res) => {
	res.status(405).end();
});

module.exports = router;