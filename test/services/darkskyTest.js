var chai = require('chai');
var assert = chai.assert;
var config = require('config');

describe("darksky", function() {
    this.timeout(10000);
    var darkskyWrapper = require('./../../services/darksky.js'),
        MockReq = require('./../mocks/MockReq.js'),
        MockRes = require('./../mocks/MockRes.js'),
        defaults = {
            "endpoint": "api.darksky.net",
            "pathRoot": "/forecast",
            "secret": config.get("darksky.secret")
        },
        lat = 45.5278,
        long = -122.8013;

    function testResponseBody(data) {
        assert.equal(lat, JSON.parse(data).latitude);
    }

    describe("#fetch()", function() {
        it('should return the raw json from darksky', function(done) {
            try {
                var darksky = darkskyWrapper(defaults);
                darksky.fetch(lat, long, function(data) {
                    testResponseBody(data);
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
                    testResponseBody(body);
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
});
