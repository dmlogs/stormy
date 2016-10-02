module.exports = function MockRes(validation) {
    this.status = function(data) {
        this.statusCode = data;
        return this;
    }

    this.send = function(data) {
        validation(this.statusCode, data);
    }
}
