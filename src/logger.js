
'use strict';

const path = require('path');

const winston                = require('winston');
const winstonDailyRotateFile = require('winston-daily-rotate-file');
const logger                 = winston.createLogger({
	transports: [
		new winston.transports.Console({
			format: winston.format.combine(
				winston.format.timestamp(),
				winston.format.colorize(),
				winston.format.printf(log => `[${log.timestamp}] ${log.level} : ${log.message}`)
			)
		}),
		new winstonDailyRotateFile({
			zippedArchive: true,
			maxSize      : '24m',
			dirname      : path.resolve(__dirname, '../log/error'),
			filename     : 'error_%DATE%.log',
			level        : 'error',
			format       : winston.format.combine(
				winston.format.timestamp(),
				winston.format.printf(log => `[${log.timestamp}] ${log.level} : ${log.message}`)
			)
		}),
		new winstonDailyRotateFile({
			zippedArchive: true,
			maxSize      : '24m',
			dirname      : path.resolve(__dirname, '../log/info'),
			filename     : 'info_%DATE%.log',
			level        : 'info',
			format       : winston.format.combine(
				winston.format.timestamp(),
				winston.format.printf(log => `[${log.timestamp}] ${log.level} : ${log.message}`)
			)
		})
	],
	exceptionHandlers: [
		new winston.transports.Console(),
		new winstonDailyRotateFile({
			zippedArchive: true,
			maxSize      : '24m',
			dirname      : path.resolve(__dirname, '../log/exception'),
			filename     : 'exception_%DATE%.log',
			format       : winston.format.combine(
				winston.format.timestamp(),
				winston.format.printf(log => `[${log.timestamp}] ${log.level} : ${log.message}`)
			)
		})
	]
});

module.exports = logger;