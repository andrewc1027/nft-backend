const AWS = require('aws-sdk');
AWS.config.update({region: 'us-east-2'});
const mail = new AWS.SES();

module.exports = mail;
