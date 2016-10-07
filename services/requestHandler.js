module.exports = (sources) => {
    return {
        get: function(req, res, source) {
            console.log(`source is:${source}`);
            if (!source) {
              res.status(400).send("no source provided.");
              return;
            }
            if (!sources.hasOwnProperty(source)) {
              res.status(400).send(`source "${source}" is unknown.`);
              return;
            }

            if (!req.query.lat) {
                res.status(400).send("missing latitude.");
                return;
            };
            if (!req.query.long) {
                res.status(400).send("missing longitude.");
                return;
            }

            var src = sources[source],
              lat = req.query.lat,
              long = req.query.long;

            function success (body) {
              res.status(200).send(body);
            }

            function error (err) {
              res.status(404).send(err);
            }

            if (req.query.f == "std") {
                try {
                  src.getStandardized(lat,long, success, error);
                } catch (e) {
                  res.status(500).send(`An error occurred processing the returned data: \n\n${e}`)
                }
            }
            else {
              src.getRaw(lat,long, success, error);
            }
        }
    }
}
