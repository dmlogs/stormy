var http = require('http');
var https = require('https');


module.exports = () => {
  var fetch = {};

  fetch.getHttps = function(rq, callback, error) {
    fetch.get(https,rq,callback,error);
  }

  fetch.getHttp = function(rq,callback, error) {
    fetch.get(http,rq,callback,error);
  }

  fetch.get = function (handler, rq, callback, error) {
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

  return fetch;
}
