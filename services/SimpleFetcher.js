var http = require('http');
var https = require('https');


module.exports = () => {
  var SimpleFetcher = {};

  SimpleFetcher.getHttps = function(rq, callback, error) {
    SimpleFetcher.get(https,rq,callback,error);
  }

  SimpleFetcher.getHttp = function(rq,callback, error) {
    SimpleFetcher.get(http,rq,callback,error);
  }

  SimpleFetcher.get = function (handler, rq, callback, error) {
    handler.get(rq, (res) => {
      var raw = "";
      res.on('data', (chunk) => {
        raw += chunk;
      });
      res.on('end', () => {
        callback(raw);
      });
    }).on('error', (err) => {
      error(err);
    });
  }

  return SimpleFetcher;
}
