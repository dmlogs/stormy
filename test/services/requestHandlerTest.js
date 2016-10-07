var chai = require('chai');
var assert = chai.assert;

describe("requestHandler", function() {
  var requestHandlerConstructor = require('./../../services/requestHandler.js'),
   MockReq = require('./../mocks/MockReq.js'),
   MockRes = require('./../mocks/MockRes.js'),
   MockService = require('./../mocks/MockService.js');

  describe("#get()", function() {
      it('source not provided',function(done) {
        var requestHandler = requestHandlerConstructor();
        var req = new MockReq();
        var res = new MockRes(function(statusCode,data) {
          assert.equal(400,statusCode);
          assert.equal("no source provided.", data);
          done();
        });
        requestHandler.get(req,res);
      });

      it('source does not exist',function(done) {
        var requestHandler = requestHandlerConstructor({});
        var req = new MockReq();
        var res = new MockRes(function(statusCode,data) {
          assert.equal(400,statusCode);
          assert.equal('source "notvalid" is unknown.', data);
          done();
        });
        requestHandler.get(req,res,"notvalid");
      });

      it('query parameter lat is missing',function(done) {
        var requestHandler = requestHandlerConstructor({"exists":true});
        var req = new MockReq();
        var res = new MockRes(function(statusCode,data) {
          assert.equal(400,statusCode);
          assert.equal("missing latitude.", data);
          done();
        });
        requestHandler.get(req,res,"exists");
      });

      it('query parameter long is missing',function(done) {
        var requestHandler = requestHandlerConstructor({"exists":true});
        var req = new MockReq();
        var res = new MockRes(function(statusCode,data) {
          assert.equal(400,statusCode);
          assert.equal("missing longitude.", data);
          done();
        });
        req.setLat(100);
        requestHandler.get(req,res,"exists");
      });

      it('no query parameter f and success',function(done) {
        var service = new MockService(function(type,lat,long,success,error) {
          assert.equal('raw',type);
          assert.equal(100,lat);
          assert.equal(200,long);
          success("success");
        });
        var requestHandler = requestHandlerConstructor({"service":service});
        var req = new MockReq();
        var res = new MockRes(function(statusCode,data) {
          assert.equal(200,statusCode);
          assert.equal("success", data);
          done();
        });
        req.setLatLong(100,200);
        requestHandler.get(req,res,"service");
      });

      it('no query parameter f and error',function(done) {
        var service = new MockService(function(type,lat,long,success,error) {
          assert.equal('raw',type);
          assert.equal(100,lat);
          assert.equal(200,long);
          error("error");
        });
        var requestHandler = requestHandlerConstructor({"service":service});
        var req = new MockReq();
        var res = new MockRes(function(statusCode,data) {
          assert.equal(404,statusCode);
          assert.equal("error", data);
          done();
        });
        req.setLatLong(100,200);
        requestHandler.get(req,res,"service");
      });

      it('query parameter f is std',function(done) {
        var service = new MockService(function(type,lat,long,success,error) {
          assert.equal('std',type);
          assert.equal(100,lat);
          assert.equal(200,long);
          success("success");
        });
        var requestHandler = requestHandlerConstructor({"service":service});
        var req = new MockReq();
        var res = new MockRes(function(statusCode,data) {
          assert.equal(200,statusCode);
          assert.equal("success", data);
          done();
        });
        req.setLatLong(100,200);
        req.setStd();
        requestHandler.get(req,res,"service");
      });

      it('query parameter f is std, but error occurs in getStandardized', function(done) {
        var service = new MockService(function(type,lat,long,success,error) {
          assert.equal('std',type);
          assert.equal(100,lat);
          assert.equal(200,long);
          throw "error";
        });
        var requestHandler = requestHandlerConstructor({"service":service});
        var req = new MockReq();
        var res = new MockRes(function(statusCode,data) {
          assert.equal(500,statusCode);
          assert.equal("An error occurred processing the returned data: \n\nerror", data);
          done();
        });
        req.setLatLong(100,200);
        req.setStd();
        requestHandler.get(req,res,"service");
      });
  });
});
