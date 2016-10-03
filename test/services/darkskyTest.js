var chai = require('chai');
var assert = chai.assert;
var config = require('config');
var fs = require('fs');

describe("darksky", function() {
    this.timeout(10000);
    var darkskyWrapper = require('./../../services/darksky.js'),
        MockReq = require('./../mocks/MockReq.js'),
        MockRes = require('./../mocks/MockRes.js'),
        defaults = {
            "endpoint": "api.darksky.net",
            "pathRoot": "/forecast",
            "secret": config.get("darksky.secret"),
            "exclude": "minutely,hourly,alerts,flags",
            "reportPath": "https://darksky.net"
        },
        lat = 45.5278,
        long = -122.8013;

    function verifyResponseBody(data) {
        assert.equal(lat, JSON.parse(data).latitude);
    }

    function verifyStandardizedResponse(result, latitude, longitude) {
        latitude = latitude || 42.3601;
        longitude = longitude || -71.0589;

        assert.equal(`https://darksky.net/${latitude},${longitude}`, result.report);
        assert.isNotNull(result.lat);
        assert.isNotNull(result.long);
        assert.isNotNull(result.current);
        assert.isNotNull(result.current.timestamp);
        assert.isNotNull(result.current.temperature);
        assert.isNotNull(result.current.summary);
        assert.isNotNull(result.daily);
        assert.equal(8, result.daily.length);
    }

    describe("#fetch()", function() {
        it('should return the raw json from darksky', function(done) {
            try {
                var darksky = darkskyWrapper(defaults);
                darksky.fetch(lat, long, function(data) {
                    verifyResponseBody(data);
                    done();
                }, function(err) {
                    assert.isTrue(false);
                })
            } catch (e) {
                done(e);
            }
        });
    });

    describe("#requestHandler()", function() {
        it('should return the raw json in a response with status 200', function(done) {
            try {
                function validation(status, body) {
                    assert.equal(status, 200);
                    verifyResponseBody(body);
                    done();
                }

                var darksky = darkskyWrapper(defaults),
                    req = new MockReq(),
                    res = new MockRes(validation);

                req.setLatLong(lat, long);
                darksky.requestHandler(req, res);
            } catch (e) {
                done(e);
            }
        });

        it('should return the standardized json in a response with status 200', function(done) {
            try {
                function validation(status, body) {
                    assert.equal(status, 200);
                    verifyStandardizedResponse(body, lat, long);
                    done();
                }

                var darksky = darkskyWrapper(defaults),
                    req = new MockReq(),
                    res = new MockRes(validation);

                req.setLatLong(lat, long);
                req.query.f = "std";
                darksky.requestHandler(req, res);
            } catch (e) {
                done(e);
            }
        });

        it('should return status 400 with body of \'missing latitude.\'', function(done) {
            try {
                function validation(status, body) {
                    assert.equal(status, 400);
                    assert.equal(body, "missing latitude.");
                    done();
                }

                var darksky = darkskyWrapper(defaults),
                    req = new MockReq(),
                    res = new MockRes(validation);

                req.setLong(long);
                darksky.requestHandler(req, res);
            } catch (e) {
                done(e);
            }
        });

        it('should return status 400 with body of \'missing longitude.\'', function(done) {
            try {
                function validation(status, body) {
                    assert.equal(status, 400);
                    assert.equal(body, "missing longitude.");
                    done();
                }

                var darksky = darkskyWrapper(defaults),
                    req = new MockReq(),
                    res = new MockRes(validation);

                req.setLat(lat);
                darksky.requestHandler(req, res);
            } catch (e) {
                done(e);
            }
        });
    });

    describe("#standardizeResponse()", function() {
        var darkskySampleResponse = fs.readFileSync('./test/data/darkskySampleResponse.json');

        it('should parse and standardize the response', function() {
            var darksky = darkskyWrapper(defaults);
            var result = darksky.standardizeResponse(darkskySampleResponse);
            verifyStandardizedResponse(result);
        });
    });
});