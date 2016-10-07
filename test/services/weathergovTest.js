var chai = require('chai');
var assert = chai.assert;
var fs = require('fs');

describe("weathergov", function() {
    var weathergovConstructor = require('./../../services/weather/weathergov.js'),
        MockFetcher = require('./../mocks/MockFetcher.js'),
        defaults = {
            "endpoint": "forecast.weather.gov",
            "pathRoot": "/MapClick.php?",
            "unit": 0,
            "lg": "english",
            "fcstType": "json"
        },
        lat = 45.5278,
        long = -122.8013;



    describe("#fetch()", function() {
        it('should build proper request and fetch', function(done) {
          var fetch = new MockFetcher();
          var weathergov = weathergovConstructor(defaults, fetch);
          weathergov.fetch(lat, long, function(handler, rq) {
              assert.equal("http", handler);
              assert.equal(defaults.endpoint, rq.host);
              assert.isNotNull(rq.path);
              assert.equal("curl/7.43.0",rq.headers["User-Agent"]);
              done();
          }, function(err) {
              assert.isTrue(false);
          });
        });
    });

    describe("#getPath()", function() {
        it('should return the correct path with fcstType', function() {
            var weathergov = weathergovConstructor(defaults);
            var result = weathergov.getPath(1, 2, true);
            assert.equal(`/MapClick.php?lat=1&lon=2&unit=${defaults.unit}&lg=${defaults.lg}&FcstType=${defaults.fcstType}`, result);
        });

        it('should return the correct path', function() {
            var weathergov = weathergovConstructor(defaults);
            var result = weathergov.getPath(1, 2, false);
            assert.equal(`/MapClick.php?lat=1&lon=2&unit=${defaults.unit}&lg=${defaults.lg}`, result);
        });
    });

    describe("#standardizeResponse()", function() {
        var weathergovSampleResponse = fs.readFileSync('./test/data/weathergovSampleResponse.json');

        it('should parse and standardize the response, last no low', function(done) {
            var weathergov = weathergovConstructor(defaults);
            var result = weathergov.standardizeResponse(weathergovSampleResponse,function(result) {
              assert.equal(`http://forecast.weather.gov/MapClick.php?lat=${lat}&lon=${long}&unit=${defaults.unit}&lg=${defaults.lg}`,result.report);
              assert.isNotNull(result.lat);
              assert.isNotNull(result.long);
              assert.isNotNull(result.current);
              assert.isNotNull(result.current.timestamp);
              assert.isNotNull(result.current.temperature);
              assert.isNotNull(result.current.summary);
              assert.equal(7, result.daily.length);
              var entry = result.daily[6];
              assert.isUndefined(entry.temperatureMin);
              assert.isNotNull(entry.temperatureMax);
              done();
            },lat,long);
        });
    });
});
