var chai = require('chai');
var express = require('express');
var assert = chai.assert;

var weathergovWrapper = require('./../../services/weathergov.js');

var defaults = {
    "endpoint": "forecast.weather.gov",
    "pathRoot": "/MapClick.php?",
    "unit": 0,
    "lg": "english",
    "fcstType": "json"
}

var lat = 45.5278,
    long = -122.8013;

function MockReq() {
    this.query = {}
    this.setLat = function() {
        this.query.lat = lat;
    }

    this.setLong = function() {
        this.query.long = long;
    }

    this.setLatLong = function() {
        this.setLat();
        this.setLong();
    }
};

function MockRes(validation) {
    this.status = function(data) {
        this.statusCode = data;
        return this;
    }

    this.send = function(data) {
        this.body = data;
        validation(this.statusCode, this.body);
    }
}

function testResponseBody(data) {
    assert.isNotNull(data.operationalMode);
}

describe("weathergov", function() {
    describe("#fetch()", function() {
        it('should return the raw json from weather.gov', function() {
            var weathergov = weathergovWrapper(defaults);
            weathergov.fetch(
                lat,
                long,
                defaults.units,
                defaults.lg,
                defaults.fcstType,
                testResponseBody,
                function(err) {
                    assert.isTrue(false);
                }
            )
        });
    });

    describe("#requestHandler()", function() {
        it('should return the raw json in a response with status 200', function(done) {
            setTimeout(done, 10000);

            function validation(status, body) {
                assert.equal(status, 200);
                testResponseBody(body);
                done();
            }

            var weathergov = weathergovWrapper(defaults),
                req = new MockReq(),
                res = new MockRes(validation);

            req.setLatLong();

            weathergov.requestHandler(req, res);
        });

        it('should return status 400 with body of \'missing latitude.\'', function(done) {
            function validation(status, body) {
                assert.equal(status, 400);
                assert.equal(body, "missing latitude.");
                done();
            }

            var weathergov = weathergovWrapper(defaults),
                req = new MockReq(),
                res = new MockRes(validation);

            req.setLong();

            weathergov.requestHandler(req, res);
        });

        it('should return status 400 with body of \'missing longitude.\'', function(done) {
            function validation(status, body) {
                assert.equal(status, 400);
                assert.equal(body, "missing longitude.");
                done();
            }

            var weathergov = weathergovWrapper(defaults),
                req = new MockReq(),
                res = new MockRes(validation);

            req.setLat();

            weathergov.requestHandler(req, res);
        });
    });
});