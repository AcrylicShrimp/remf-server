
'use strict';

const firebaseAdmin = require('firebase-admin');

firebaseAdmin.initializeApp({
	credential: firebaseAdmin.credential.cert(require('../credencials/serviceAccountKey.json'))
});

module.exports = async (user, title, body) => {
	return firebaseAdmin.messaging().send({
		notification: {
			title: title,
			body : body
		},
		token: user.firebaseToken
	});
};