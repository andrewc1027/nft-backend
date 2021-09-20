const error = require('../middleware/error');
const express = require('express');

const cors = require('cors');


const bodyParser = require("body-parser");
const fileUpload = require("express-fileupload");

const users = require('../routes/users');


// const error = require('../middleware/error');


module.exports = function(app) {

  app.use(express.json({limit: "50mb"}));


  app.use(
    bodyParser.urlencoded({
        extended: false,
        limit: "50mb",
    })
  );
  app.use(
      bodyParser.json({
          limit: "50mb",
      })
  );
  app.use(
      fileUpload({
          createParentPath: true,
          limits: {
              fileSize: 5 * 1024 * 1024 * 1024, //2MB max file(s) size
          },
      })
  );

  app.use(cors());
  
  app.use('/api/users', users);
  
  
  app.use(error);
};