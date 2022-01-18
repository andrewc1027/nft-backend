const email = require('@sendgrid/mail');
email.setApiKey(process.env.SENDGRID_API_KEY);

module.exports = email;
