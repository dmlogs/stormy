module.exports = function MockService(validation) {
    this.getRaw = function(lat,long,success,error) {
      this.validate("raw",lat,long,success,error);
    }

    this.getStandardized = function(lat,long,success,error) {
      this.validate("std",lat,long,success,error);
    }

    this.validate = function(type,lat,long,success,error) {
      validation(type,lat,long,success,error);
    }
}
