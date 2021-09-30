require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const fs = require('fs');
const mongoose = require('mongoose');
const app = express();
const cors = require('cors');

app.use(cors({
  origin: '*',
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
  app.use('/', require(__dirname + '/app/routes/' + file));
});

// Default error handler
app.use((err, req, res, next) => {
  if (typeof err.handle === 'function') {
    err.handle();
  }

  console.log(err);

  res.status(err.statusCode || 500).json({
    code: err.statusCode || 500,
    msg: err.printMsg || 'Something went wrong!',
  });
});

module.exports = app;
