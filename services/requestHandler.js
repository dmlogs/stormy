var async = require('async');

module.exports = (sources) => {
    return {
        get: function(req, res, source) {
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

            function success(body) {
                res.status(200).send(body);
            }

            function error(err) {
                res.status(404).send(err);
            }

            var src = sources[source],
                lat = req.query.lat,
                long = req.query.long;

            if (req.query.f == "std") {
                try {
                    src.getStandardized(lat, long, success, error);
                } catch (e) {
                    res.status(500).send(`An error occurred processing the returned data: \n\n${e}`)
                }
            } else {
                src.getRaw(lat, long, success, error);
            }
        },
        getAll: function(req, res) {
            if (!req.query.lat) {
                res.status(400).send("missing latitude.");
                return;
            };
            if (!req.query.long) {
                res.status(400).send("missing longitude.");
                return;
            }

            function success(body) {
                res.status(200).send(body);
            }

            function error(err) {
                res.status(404).send(err);
            }

            var lat = req.query.lat,
                long = req.query.long;
            var results = {},
                errors = {};

            async.each(Object.keys(sources), function(source, done) {
                sources[source].getStandardized(lat, long, function(result) {
                    results[source] = result;
                    done();
                }, function(err) {
                    errors[source] = err;
                    done();
                });
            }, function() {
                if (Object.keys(errors).length > 0) results.error = errors;
                success(results);
            });
        }
    }
}
