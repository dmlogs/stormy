var http = require('http');

module.exports = (defaults) => {
    defaults.unit = defaults.unit || 0;
    defaults.lg = defaults.lg || "english";
    defaults.fcstType = defaults.fcstType || "json";

    var weathergov =  {
        requestHandler: function(req, res) {
            if (!req.query.lat) {
                res.status(400).send("missing latitude.");
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

            weathergov.fetch(lat, long, unit, lg, fcstType, function(data) {
                if (req.query.f == "std") {
                    try {
                        var responseBody = weathergov.standardizeResponse(data, lat, long, unit, lg);
                        res.status(200).send(responseBody);
                    } catch (e) {
                        res.status(500).send("An error occcurred processing the returned data: \n\n" + e);
                    }
                } else {
                    res.status(200).send(data);
                }
            }, function(err) {
                res.status(404).send({
                    'error': err
                });
            });
        },
        getPath: function(lat, long, unit, lg, fcstType) {
            var basics = `${defaults.pathRoot}lat=${lat}&lon=${long}&unit=${unit}&lg=${lg}`;
            if (fcstType) {
                basics += `&FcstType=${fcstType}`;
            }
            return basics;
        },
        fetch: function(lat, long, unit, lg, fcstType, callback, error) {
            var path = weathergov.getPath(lat, long, unit, lg, fcstType);

            http.get({
                "host": defaults.endpoint,
                "path": path,
                "headers": {
                    "User-Agent": "curl/7.43.0"
                }
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
        },
        standardizeResponse: function(data, lat, long, unit, lg) {
            var path = weathergov.getPath(lat,long,unit,lg);
            var json = JSON.parse(data);

            var result = {
                "report": `http://${defaults.endpoint}${path}`,
                "lat": lat,
                "long": long,
                "current": {
                    "timestamp": new Date(json.creationDate).getTime() / 1000,
                    "temperature": json.currentobservation.Temp,
                    "summary": json.currentobservation.Weather
                },
                "daily": []
            }

            var temp = {};

            function getDateTimestamp(startValidTime) {
                return new Date(new Date(startValidTime).toDateString()).getTime();
            }

            for (var i = 0; i < json.data.temperature.length; i++) {
                var currentTimestamp = getDateTimestamp(json.time.startValidTime[i]);

                if (temp.timestamp && temp.timestamp != currentTimestamp) {
                    result.daily.push(temp);
                    temp = {};
                }

                temp.timestamp = currentTimestamp;

                if (json.time.tempLabel[i] == "High") {
                    temp.temperatureMax = json.data.temperature[i];
                } else {
                    temp.temperatureMin = json.data.temperature[i];
                }

                var currentPrecipProbability = json.data.pop[i];

                temp.precipProbability = (
                    temp.precipProbability == undefined ? currentPrecipProbability : (
                        temp.precipProbability > currentPrecipProbability ? temp.precipProbability : currentPrecipProbability
                    )
                );

                temp.summary = (temp.summary ? temp.summary + ". Then " : "") + json.data.weather;

            }

            // assert temp is not blank
            if (temp.timestamp) {
                result.daily.push(temp);
            }

            return result;
        }
    }

    return weathergov;
}
