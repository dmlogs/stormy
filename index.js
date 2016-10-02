var express = require('express');
var config = require('config');
var weathergov = require('./services/weathergov.js')(config.get("weathergov"));
var darksky = require('./services/darksky.js')(config.get("darksky"));

var app = express();

app.set('view engine', 'pug');
app.set('views', './views');
app.use(express.static('public'));

app.get('/api/external/weathergov', function(req, res) {
    weathergov.requestHandler(req, res);
});

app.get('/api/external/darksky', function(req, res) {
  darksky.requestHandler(req, res);
});

var port = process.env.PORT || config.get("port");

app.listen(port, function() {
    console.log(`STORMY is listening on port ${port}!`);
});
