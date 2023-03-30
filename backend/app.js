const express = require('express');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
let cors = require("cors");
let bodyParser = require("body-parser");
require("dotenv").config();

const mongoose = require('mongoose');

const indexRouter = require('./routes/index');
const gatewaysRouter = require('./routes/gateways');

const environment = require('./config/environment');
const swaggerDocs = require("./swagger");

const app = express();

app.use(logger('dev'));
app.use(cors());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(cookieParser());

// Connect to Mongoose and set connection variable
// MongoDB connection
console.log("connection string", environment.mongodb.uri);
console.log("secret", environment.secret);
mongoose.connect(environment.mongodb.uri, {dbName: 'gateways'}).then(
    () => console.log("Connected to database"),
    err => console.log("Database error: ", err)
);

app.use('/gateways', gatewaysRouter);
app.use('/', indexRouter);

swaggerDocs(app);

app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(500).send('Something broke!')
});

module.exports = app;
