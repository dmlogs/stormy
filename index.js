var express = require('express');
var config = require('config');
var requestHandler = require('./services/requestHandler.js')();
var fetch = require('./services/fetch.js')();
var weathergov = require('./services/weathergov.js')(config.get("weathergov"), fetch);
var darksky = require('./services/darksky.js')(config.get("darksky"), fetch);

var app = express();

app.set('view engine', 'pug');
app.set('views', './views');
app.use(express.static('public'));

app.get('/api/external/weathergov', function(req, res) {
    requestHandler.get(req, res, weathergov);
});

app.get('/api/external/darksky', function(req, res) {
    requestHandler.get(req,res,darksky);
});

var port = process.env.PORT || config.get("port");

app.listen(port, function() {
    console.log(`STORMY is listening on port ${port}!`);
});
