var chai = require('chai');
var assert = chai.assert;

describe("weathergov", function() {
    this.timeout(10000);
    var weathergovWrapper = require('./../../services/weathergov.js'),
        MockReq = require('./../mocks/MockReq.js'),
        MockRes = require('./../mocks/MockRes.js'),

        defaults = {
            "endpoint": "forecast.weather.gov",
            "pathRoot": "/MapClick.php?",
            "unit": 0,
            "lg": "english",
            "fcstType": "json"
        },
        lat = 45.5278,
        long = -122.8013;

    function testResponseBody(data) {
        assert.isNotNull(JSON.parse(data).operationalMode);
    }

    describe("#fetch()", function() {
        it('should return the raw json from weather.gov', function(done) {
            try {
                var weathergov = weathergovWrapper(defaults);
                weathergov.fetch(
                    lat,
                    long,
                    defaults.units,
                    defaults.lg,
                    defaults.fcstType,
                    function(data) {
                        testResponseBody(data);
                        done();
                    },
                    function(err) {
                        assert.isTrue(false);
                    }
                );
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
                    testResponseBody(body);
                    done();
                }

                var weathergov = weathergovWrapper(defaults),
                    req = new MockReq(),
                    res = new MockRes(validation);

                req.setLatLong(lat, long);

                weathergov.requestHandler(req, res);
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

                var weathergov = weathergovWrapper(defaults),
                    req = new MockReq(),
                    res = new MockRes(validation);

                req.setLong(long);

                weathergov.requestHandler(req, res);
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

                var weathergov = weathergovWrapper(defaults),
                    req = new MockReq(),
                    res = new MockRes(validation);

                req.setLat(lat);

                weathergov.requestHandler(req, res);
            } catch (e) {
                done(e);
            }
        });
    });
});
