const { createLogger, format, transports } = require('winston');
const { combine, timestamp, printf } = format;

// Define log format
const logFormat = printf(({ level, message, timestamp }) => {
    return `${timestamp} ${level}: ${message}`;
});

// Create logger instance
const logger = createLogger({
    format: combine(timestamp(), logFormat),
    transports: [
        new transports.Console(),
    ]
});

module.exports = logger;
