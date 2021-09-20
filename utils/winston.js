const config = require('config');
const appRoot = require('app-root-path');
const winston = require('winston');
const { createLogger, format, transports } = require('winston');
const { align, printf, combine, timestamp, label, prettyPrint, colorize } = format;

const LOG_FILENAME = 'app.log';

let logFile = `${appRoot}/logs/${LOG_FILENAME}`;

if(typeof(config.logDir) === 'string') {
  if(config.logDir[0] == '/') { // абсолютный путь
    logFile = config.logDir + '/' + LOG_FILENAME;
  }
  else `${appRoot}/${config.logDir}/${LOG_FILENAME}`;
}

let options = {
  file: {
    level: 'info',
    filename: logFile,
    handleExaptions: true,
    json: true,
    maxsize: 5242880,
    maxFiles: 5,
    colorize: false
  },
  console: {
    level: 'error',
    handleExaptions: true,
    json: true,
    colorize: true
  }
};

const logger = createLogger({
  format: combine(
    colorize(),
    timestamp(),
    prettyPrint(),
    align(),
    printf(info => `${info.timestamp} ${info.level}: ${info.message}`)
  ),
  transports:[
    new winston.transports.File(options.file),
    new winston.transports.Console(options.console)
  ],
  })

logger.stream = {
  write: function( message, encoding ) {
    logger.info(message);
  }
};

module.exports = logger;