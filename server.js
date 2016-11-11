var express = require('express');
var app = express();
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var mongoUri = 'mongodb://localhost/rest-apis';
var db = mongoose.connection;
mongoose.connect(mongoUri);

app.use(bodyParser.json());

db.on('error', function () {
    throw new Error('unable to connect at' + mongoUri);
})

require('./models/pirate');
require('./routes')(app);

app.listen(3004);
console.log('port 3004');
