module.exports = function MockFetcher() {
  this.getHttps = function(rq, callback, error) {
    this.get("https",rq,callback,error);
  }
  this.getHttp = function(rq, callback, error) {
    this.get("http",rq,callback,error);
  }
  this.get = function(handler,rq, callback, error) {
    callback(handler,rq);
  }
};
