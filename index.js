var express = require('express');
var config = require('config');
var fetch = require('./services/fetch.js')();
var weathergov = require('./services/weather/weathergov.js')(config.get("weathergov"), fetch);
var darksky = require('./services/weather/darksky.js')(config.get("darksky"), fetch);
var requestHandler = require('./services/requestHandler.js')({
  "weathergov":weathergov,
  "darksky":darksky
});

var app = express();

app.set('view engine', 'pug');
app.set('views', './views');
app.use(express.static('public'));

app.get('/api/external/:source', function(req, res) {
    requestHandler.get(req, res, req.params.source);
});

var port = process.env.PORT || config.get("port");

app.listen(port, function() {
    console.log(`STORMY is listening on port ${port}!`);
});
