var https = require('https');

module.exports = (defaults) => {
  if (defaults.secret == undefined) {
    throw("secret is not defined. Please add the configuration darksky.secret which is the secret key needed to use the Dark Sky API.");
  }

  defaults.endpoint = defaults.endpoint || "api.darksky.net";
  defaults.pathRoot = defaults.pathRoot || "/forecast";

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

      var standardizeResponse = this.standardizeResponse

      this.fetch(lat,long, function(data) {
        if(req.query.f == "std") {
          try {
            var responseBody = standardizeResponse(data);
            res.status(200).send(responseBody);
          } catch (e) {
            res.status(500).send("An error occurred processing the returned data: \n\n" + e);
          }
        }
        else {
          res.status(200).send(data);
        }
      }, function(err) {
        res.status(404).send({
            'error': err
        });
      });
    },
    fetch: function(lat, long, callback, error) {
      var path = `${defaults.pathRoot}/${defaults.secret}/${lat},${long}?exclude=${defaults.exclude}`

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
    },
    standardizeResponse: function(data) {
      var json = JSON.parse(data);
      var result = {
        "report": `${defaults.reportPath}/${json.latitude},${json.longitude}`,
        "lat": json.latitude,
        "long": json.longitude,
        "current": {
          "timestamp": json.currently.time,
          "temperature": json.currently.temperature,
          "summary": json.currently.summary
        },
        "daily": []
      }

      json.daily.data.forEach(function (data) {
        result.daily.push({
          "timestamp": data.time,
          "temperatureMin": data.temperatureMin,
          "temperatureMax": data.temperatureMax,
          "precipProbability": data.precipProbability,
          "precipType": data.precipType,
          "summary": data.summary
        });
      });

      return result;
    }
  }
}
