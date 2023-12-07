const express = require('express');
const app = express();

const morgan = require('morgan');
const {default: helmet} = require('helmet');
const compression =require('compression');
require('dotenv').config();

// init middleware
app.use(morgan("dev")); // combined for prod
app.use(helmet());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({
    extended: true,
}));

// init database
require('./dbs/init.mongodb')
const {checkOverload} = require('./helpers/check.connect');
checkOverload();

//init routers
app.use('/', require('./routes'))


// handle errors

module.exports = app;