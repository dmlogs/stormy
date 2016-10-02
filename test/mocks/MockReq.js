module.exports = function MockReq() {
    this.query = {}
    this.setLat = function(lat) {
        this.query.lat = lat;
    }

    this.setLong = function(long) {
        this.query.long = long;
    }

    this.setLatLong = function(lat, long) {
        this.setLat(lat);
        this.setLong(long);
    }
};
