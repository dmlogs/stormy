module.exports = (defaults, fetcher) => {
    if (defaults.secret == undefined) {
        throw ("secret is not defined. Please add the configuration darksky.secret which is the secret key needed to use the Dark Sky API.");
    }

    defaults.endpoint = defaults.endpoint || "api.darksky.net";
    defaults.pathRoot = defaults.pathRoot || "/forecast";

    var darksky = {}

    darksky.getRaw = function(lat,long, success, error)  {
      darksky.fetch(lat,long,success,error);
    }

    darksky.getStandardized = function(lat,long, success, error) {
      darksky.fetch(lat,long,function(data) {
        darksky.standardizeResponse(data, success);
      }, error);
    }

    darksky.getPath = function (root,lat,long,secret,excludes) {
      var path = (secret ? `${root}/${secret}` : root) + `/${lat},${long}`;

      if (excludes) path += `?exclude=${excludes}`;

      return path;
    }

    darksky.fetch = function(lat, long, callback, error) {
        var path = darksky.getPath(defaults.pathRoot,lat,long,defaults.secret,defaults.exclude);

        fetcher.getHttps({
            "host": defaults.endpoint,
            "path": path
        }, callback, error);
    };

    darksky.standardizeResponse = function(data, success) {
        var json = JSON.parse(data);
        var result = {
            "report": darksky.getPath(defaults.reportPath,json.latitude,json.longitude),
            "lat": json.latitude,
            "long": json.longitude,
            "current": {
                "timestamp": json.currently.time,
                "temperature": json.currently.temperature,
                "summary": json.currently.summary
            },
            "daily": [],
            "poweredbydarksky": "https://darksky.net/poweredby/"
        }

        json.daily.data.forEach(function(data) {
            result.daily.push({
                "timestamp": data.time,
                "temperatureMin": data.temperatureMin,
                "temperatureMax": data.temperatureMax,
                "precipProbability": data.precipProbability,
                "precipType": data.precipType,
                "summary": data.summary
            });
        });

        success(result);
    }

    return darksky;
}
