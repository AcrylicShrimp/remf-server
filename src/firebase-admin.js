
'use strict';

const firebaseAdmin = require('firebase-admin');

const User = require('./models/User');

firebaseAdmin.initializeApp({
	credential: firebaseAdmin.credential.cert(require('../credencials/serviceAccountKey.json'))
});

module.exports = async () => {
	const user = await User.findOne({ username: 'test' }, { firebaseToken: true });

	if (!user)
		return;

	console.log(await firebaseAdmin.messaging().send({
		notification: {
			title: 'lol',
			body : 'lol'
		},
		token: user.firebaseToken
	}));
};