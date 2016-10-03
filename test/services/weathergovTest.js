var chai = require('chai');
var assert = chai.assert;
var fs = require('fs');

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

    function verifyResponseBody(data) {
        assert.isNotNull(JSON.parse(data).operationalMode);
    }

    function verifyStandardizedResponse(result, latitude, longitude) {
        latitude = latitude || lat;
        longitude = longitude || long;

        assert.equal(`http://forecast.weather.gov/MapClick.php?lat=${latitude}&lon=${longitude}&unit=${defaults.unit}&lg=${defaults.lg}`,result.report);
        assert.isNotNull(result.lat);
        assert.isNotNull(result.long);
        assert.isNotNull(result.current);
        assert.isNotNull(result.current.timestamp);
        assert.isNotNull(result.current.temperature);
        assert.isNotNull(result.current.summary);
        assert.isNotNull(result.current.daily);
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
                        verifyResponseBody(data);
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

    describe("#getPath()", function() {
        it('should return the correct path with fcstType', function() {
            var weathergov = weathergovWrapper(defaults);
            var result = weathergov.getPath(1, 2, 3, 4, 5);
            assert.equal("/MapClick.php?lat=1&lon=2&unit=3&lg=4&FcstType=5", result);
        });

        it('should return the correct path', function() {
            var weathergov = weathergovWrapper(defaults);
            var result = weathergov.getPath(1, 2, 3, 4);
            assert.equal("/MapClick.php?lat=1&lon=2&unit=3&lg=4", result);
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

                var weathergov = weathergovWrapper(defaults),
                    req = new MockReq(),
                    res = new MockRes(validation);

                req.setLatLong(lat, long);

                weathergov.requestHandler(req, res);
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

                var weathergov = weathergovWrapper(defaults),
                    req = new MockReq(),
                    res = new MockRes(validation);

                req.setLatLong(lat, long);
                req.query.f = "std";
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

    describe("#standardizeResponse()", function() {
        var weathergovSampleResponse = fs.readFileSync('./test/data/weathergovSampleResponse.json');

        function verifyStandardizedResponseLastNoLow(data) {
            assert.equal(7, data.daily.length);
            var entry = data.daily[6];
            assert.isNull(enty.temepratureMin);
            assert.isNotNull(enty.temepratureMax);
        }

        it('should parse and standardize the response, last no low', function() {
            var weathergov = weathergovWrapper(defaults);
            var result = weathergov.standardizeResponse(weathergovSampleResponse,lat,long,defaults.unit,defaults.lg);
            verifyStandardizedResponse(result);
        });
    });
});
