var chai = require('chai');
var assert = chai.assert;
var fs = require('fs');

describe("darksky", function() {
    var darkskyConstructor = require('./../../services/weather/darksky.js'),
        MockFetcher = require('./../mocks/MockFetcher.js'),
        defaults = {
            "endpoint": "api.darksky.net",
            "pathRoot": "/forecast",
            "secret": "test",
            "exclude": "minutely,hourly,alerts,flags",
            "reportPath": "https://darksky.net"
        },
        lat = 45.5278,
        long = -122.8013;

    describe("#getPath()", function() {
        var darksky = darkskyConstructor(defaults);
        it('should return path with secret but without excludes', function() {
            var result = darksky.getPath(defaults.pathRoot, lat, long, defaults.secret);
            assert.equal(`${defaults.pathRoot}/${defaults.secret}/${lat},${long}`,result);
        });

        it('should return path with secret and excludes', function() {
            var result = darksky.getPath(defaults.pathRoot, lat, long, defaults.secret, defaults.exclude);
            assert.equal(`${defaults.pathRoot}/${defaults.secret}/${lat},${long}?exclude=${defaults.exclude}`, result);
        });

        it('should return path without secret or excludes', function() {
            var result = darksky.getPath(defaults.reportPath, lat, long);
            assert.equal(`${defaults.reportPath}/${lat},${long}`,result);
        });
    });

    describe("#fetch()", function() {
        it('should build proper request and fetch', function(done) {
            var fetch = new MockFetcher();
            var darksky = darkskyConstructor(defaults, fetch);
            darksky.fetch(lat, long, function(handler, rq) {
                assert.equal("https", handler);
                assert.equal(defaults.endpoint, rq.host);
                assert.isNotNull(rq.path);
                done();
            }, function(err) {
                assert.isTrue(false);
            });
        });
    });

    describe("#standardizeResponse()", function() {
        var darkskySampleResponse = fs.readFileSync('./test/data/darkskySampleResponse.json');

        it('should parse and standardize the response', function(done) {
            var darksky = darkskyConstructor(defaults);
            var result = darksky.standardizeResponse(darkskySampleResponse, function(result) {
              var latitude = 42.3601,
                  longitude = -71.0589;

              assert.equal(`https://darksky.net/${latitude},${longitude}`, result.report);
              assert.isNotNull(result.lat);
              assert.isNotNull(result.long);
              assert.isNotNull(result.current);
              assert.isNotNull(result.current.timestamp);
              assert.isNotNull(result.current.temperature);
              assert.isNotNull(result.current.summary);
              assert.isNotNull(result.daily);
              assert.equal(8, result.daily.length);
              done();
            });
        });
    });
});
