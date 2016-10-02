var http = require('http');

module.exports = (defaults) => {
    return {
        requestHandler: function(req, res) {
            if (!req.query.lat) {
                res.status(400).send("missing latitude");
                return;
            };
            if (!req.query.long) {
                res.status(400).send("missing longitude.");
                return;
            }

            var lat = req.query.lat,
                long = req.query.long,
                unit = defaults.unit,
                lg = defaults.lg,
                fcstType = defaults.fcstType;

            this.fetch(lat, long, unit, lg, fcstType, function(data) {
                res.status(200).send(data);
            }, function(err) {
                res.status(500).send({
                    'error': err
                })
            });
        },
        fetch: function(lat, long, unit, lg, fcstType, callback, error) {
            var path = `${defaults.pathRoot}lat=${lat}&lon=${long}&unit=${unit}&lg=${lg}&FcstType=${fcstType}`

            http.get({
                "host": defaults.endpoint,
                "path": path,
                "headers": {
                    "User-Agent": "curl/7.43.0"
                }
            }, (resp) => {
                var raw = "";
                resp.on('data', (chunk) => {
                    raw += chunk;
                });
                resp.on('end', () => {
                    callback(raw);
                })
            }).on('error', (err) => {
                error(err);
            });
        }
    }
}