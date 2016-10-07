module.exports = () => {
    return {
        get: function(req, res, fn) {
            if (!req.query.lat) {
                res.status(400).send("missing latitude.");
                return;
            };
            if (!req.query.long) {
                res.status(400).send("missing longitude.");
                return;
            }

            var lat = req.query.lat, long = req.query.long;

            function success (body) {
              res.status(200).send(body);
            }

            function error (err) {
              res.status(404).send(err);
            }

            if (req.query.f == "std") {
                try {
                  fn.getStandardized(lat,long, success, error);
                } catch (e) {
                  res.status(500).send(`An error occurred processing the returned data: \n\n${e}`)
                }
            }
            else {
              fn.getRaw(lat,long, success, error);
            }
        }
    }
}
