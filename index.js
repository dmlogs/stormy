var express = require('express');
var config = require('config');
var weathergov = require('./weathergov.js')(config.get("weathergov"));

var app = express();

app.set('view engine', 'pug');
app.set('views', './views');
app.use(express.static('public'));

app.get('/api/external/weathergov', function(req,res) {
  weathergov.requestHandler (req,res);
});

var port = process.env.PORT || config.get("port");

app.listen(port,function() {
  console.log(`STORMY is listening on port ${port}!`);
});
