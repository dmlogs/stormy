# Stormy

Weather data aggregator.
Ski forecasts.

## API

- **/api/external/weathergov**
  - Query Parameters:
    - lat: latitude (*required*)
    - long: longitude (*required*)
  - Returns: Raw json response from weathergov
  - Example: */api/external/weathergov?lat=45.5278&long=-122.8013*

## Weather Data

- ### Weather Underground
  - **API**
    - Free tier limited to 500 calls per day; Certain features more expensive outside of free tier.
    - Current Conditions
    - Hourly 1 day forecast
    - 3 day forecast
    - 10 day forecast
    - Hourly 10 day forecast
    - [Documentation](https://www.wunderground.com/weather/api/d/docs)

- ### Yahoo Weather
  - **API**
    - Free tier, 2000 calls per day
    - Forecast for today and tomorrow
    - [Documentation](https://developer.yahoo.com/weather/)

- ### Open Weather Map

  - **API**
    - Free tier
    - 5 days / 3 hour forecast api
    - Limited to 60 calls per minute
    - [Documentation](https://openweathermap.org/api)

- ### Weather.gov

  - **API**
    - Free to consume.
    - Based on lat/lon
    - 7 + nights
    - [Example](http://forecast.weather.gov/MapClick.php?lat=45.5278&lon=-122.8013&unit=0&lg=english&FcstType=json)
    - [XML Documentation](http://graphical.weather.gov/xml/), have not found json documentation, but API appears to work.

- ### Dark Sky

  - **API**
    - Free for first 1,000 rq per day
    - Hourly data up to 7 days
    - Required to display [Powered by Dark Sky](https://darksky.net/poweredby/) prominently in the app/service.
    - [Documentation](https://darksky.net/dev/docs)


## Ski Resorts?

## Background

This app was built for my own personal needs in regards to consuming weather data, particularly when it comes to outdoor adventures. The breadth of this application will evolve over time as I am able to dedicate time towards this project. Feel free to send me feature requests and I may consider them.

## License

GPL-3, see LICENSE.txt included with this project.
