const winston = require("winston");
const mongoose = require("mongoose");
const config = require("config");

module.exports = function() {
  //mongoose.connect('mongodb://localhost/vidly')
  let dbConnect = '';
  if(
    typeof(config.dbuser) !== 'undefined' && 
    config.dbuser.length > 0 &&

    typeof(config.dbuser_pwd) !== 'undefined' && 
    config.dbuser_pwd.length > 0 &&
    
    typeof(config.dbhost) !== 'undefined' &&
    config.dbuser_pwd.length > 0
  ) {
    dbConnect = 'mongodb+srv://' +
      config.dbuser +
      ':' +
      config.dbuser_pwd +
      '@' +
      config.dbhost +
      '/' +
      config.db 
      +'?retryWrites=true';
  }
  else {
    dbConnect = config.db;
  }

  mongoose
    .connect(
      dbConnect, 
      { useNewUrlParser: true }
    )
    .then(() => winston.info("Connected to MongoDB: " + config.db))
    .catch(e => {
      console.log("Ошибка в коннекте к базе: " + e);
      winston.info('NOT connected to MongoDB...');
    });
};
