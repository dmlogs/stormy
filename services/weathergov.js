module.exports = (defaults, fetch) => {
    defaults.unit = defaults.unit || 0;
    defaults.lg = defaults.lg || "english";
    defaults.fcstType = defaults.fcstType || "json";

    var weathergov = {};

    weathergov.getPath = function(lat, long, isJsonRq) {
        var basics = `${defaults.pathRoot}lat=${lat}&lon=${long}&unit=${defaults.unit}&lg=${defaults.lg}`;
        if (isJsonRq) {
            basics += `&FcstType=${defaults.fcstType}`;
        }
        return basics;
    };

    weathergov.getRaw = function(lat, long, success, error) {
        weathergov.fetch(lat, long, success, error);
    }

    weathergov.getStandardized = function(lat, long, success, error) {
        weathergov.fetch(lat, long, function(data) {
            weathergov.standardizeResponse(data, success, lat, long);
        }, error);
    }

    weathergov.fetch = function(lat, long, callback, error) {
        var path = weathergov.getPath(lat, long, true);

        fetch.getHttp({
            "host": defaults.endpoint,
            "path": path,
            "headers": {
                "User-Agent": "curl/7.43.0"
            }
        }, callback, error);
    };

    weathergov.standardizeResponse = function(data, success, lat, long) {
        var path = weathergov.getPath(lat, long, false);
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

            var currentPrecipProbability = json.data.pop[i] || 0;

            temp.precipProbability = (
                temp.precipProbability == undefined ? currentPrecipProbability : (
                    temp.precipProbability > currentPrecipProbability ? temp.precipProbability : currentPrecipProbability
                )
            );

            temp.summary = (temp.summary ? temp.summary + ". Then " : "") + json.data.weather[i];

        }

        // assert temp is not blank
        if (temp.timestamp) {
            result.daily.push(temp);
        }

        success(result);
    }


    return weathergov;
}
