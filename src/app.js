require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const fs = require('fs');
const mongoose = require('mongoose');
const app = express();
const cors = require('cors');
const mail = require('./app/config/sendgrid');
const MulterError = require('multer').MulterError;

app.use(cors({
  origin: process.env.CORS_ORIGIN,
}));
mongoose.connect(process.env.MONGO_CONN);
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error: '));
db.once('open', function() {
  console.log('Connected successfully');
});

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());

// Dynamic routing
fs.readdirSync(__dirname + '/app/routes').forEach((file) => {
  if (fs.lstatSync(__dirname + '/app/routes/' + file).isFile()) {
    app.use('/', require(__dirname + '/app/routes/' + file));
  }
  if (fs.lstatSync(__dirname + '/app/routes/' + file).isDirectory()) {
    fs.readdirSync(__dirname + '/app/routes/' + file).forEach((file2) => {
      app.use('/', require(__dirname + `/app/routes/${file}/${file2}`));
    });
  }
});

// Default error handler
app.use((err, req, res, next) => {
  if (typeof err.handle === 'function') {
    err.handle();
  }

  console.log(err);

  if (err instanceof MulterError) {
    res.status(err.statusCode || 500).json({
      code: err.code || 500,
      msg: err.message,
    });
  }
  res.status(err.statusCode || 500).json({
    code: err.statusCode || 500,
    msg: err.printMsg || 'Something went wrong!',
  });
});

process.on('uncaughtException', function(er) {
  console.log(er.stack);
  mail.send({
    to: 'jon@homejab.com',
    from: 'support@homejab.com',
    subject: 'Sending with Twilio SendGrid is Fun',
    text: 'and easy to do anywhere, even with Node.js',
    html: '<strong>and easy to do anywhere, even with Node.js</strong>',
  });
});
module.exports = app;
