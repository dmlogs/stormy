var https = require('https');

module.exports = (defaults) => {
  return {
    requestHandler: function(req, res) {
      if (!req.query.lat) {
          res.status(400).send("missing latitude.");
          return;
      };
      if (!req.query.long) {
          res.status(400).send("missing longitude.");
          return;
      }
      var lat = req.query.lat, long = req.query.long;

      this.fetch(lat,long, function(data) {
        res.status(200).send(data);
      }, function(err) {
        res.status(404).send({
            'error': err
        });
      });
    },
    fetch: function(lat, long, callback, error) {
      var path = `${defaults.pathRoot}/${defaults.secret}/${lat},${long}`

      https.get({
        "host": defaults.endpoint,
        "path": path
      }, (res) => {
        var raw = "";
        res.on('data', (chunk) => {
          raw += chunk;
        });
        res.on('end', () => {
          callback(raw);
        });
      }).on('error', (err) => {
        error(err);
      });
    }
  }
}
