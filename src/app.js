const express = require('express');
const app = express();

const morgan = require('morgan');
const {default: helmet} = require('helmet');
const compression =require('compression');

// init middleware
app.use(morgan("dev")); // combined for prod
app.use(helmet());
app.use(compression());

// init database
require('./dbs/init.mongodb')
const {checkOverload} = require('./helpers/check.connect');
checkOverload();

//init routers
app.get('/', (req, res, next) => {
    const strCompression = 'helllo ABDBBCDBBC'
    return res.status(200).json({
        message: 'Welcome! HocPV',
        metadata: strCompression.repeat(20000)
    })
})


// handle errors

module.exports = app;