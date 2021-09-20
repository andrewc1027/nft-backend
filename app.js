const config = require('config');
// const winston = require('winston');
const winston = require('./utils/winston');
const express = require('express');
const morgan = require('morgan');
var expressHbs = require('express-handlebars');
const app = express();
app.use( morgan('combined', { stream: winston.stream} ));
// require('./startup/logging');
require('./startup/routes')(app);
require('./startup/db')();
// require('./startup/config')();
// require('./startup/validation')();

// Установили шаблинизатор в движке
app.engine('.hbs', expressHbs({
    extname: '.hbs', 
}));

app.set('view engine', '.hbs');

global.__basedir = __dirname;

const port = process.env.PORT || config.port;
app.listen(port, () => winston.info(`Listening on port ${port}...`));