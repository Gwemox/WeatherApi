const mongoose = require("mongoose");
const fs = require('fs');
const join = require('path').join;
const Schema = mongoose.Schema;
require('dotenv').config()
var express = require('express');
var app = express();
var bodyParser = require('body-parser');

const dataFixtues = require("./utils/dataFixtures");


/* ========== Mongoose ========== */

/* Use good Promise */
mongoose.Promise = Promise

mongoose.connect('mongodb://mongo_1:27017/weather', {useMongoClient: true});
mongoose.plugin(schema => { schema.options.usePushEach = true });

/* ========== END Mongoose ========== */


/* ========== Weather ========== */

const OpenWeatherMap = require("./utils/openweathermap");
OpenWeatherMap.startCron();

/* ========== END Weather ========== */

/* ========== HTTP ========== */

/* Use BodyParser for body content */
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const dirModels = join(__dirname, './models');
const excludeModels = [
    'baseModel.js'
]

var models = {}

/* Dynamic export models */
fs.readdirSync(dirModels)
    .filter(file => (~file.search(/^[^\.].*\.js$/) && excludeModels.indexOf(file) === -1))
.forEach(file => {
    let classModel = require(join(dirModels, file));
    let tmpModel = new classModel();
    models[tmpModel.constructor.name] = tmpModel;
    models[tmpModel.constructor.name].exportModel();
});

/* Declare API routes */
var apiRoutes = express.Router();
// dynamically include routes (Controller)
fs.readdirSync('./controllers/').forEach(function (file) {
    if(file.substr(-3) == '.js') {
        route = require('./controllers/' + file);
        route.controller(apiRoutes, models);
    }
});

/* Use ROUTER + protect */

app.use('/api/', apiRoutes);

/* Start Server */
var server = app.listen(3000, function() {
    console.log("[INFO] Server started on http://localhost:3000/")
});

/* ========== END HTTP ========== */

module.exports = server;