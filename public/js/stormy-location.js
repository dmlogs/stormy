var stormy = window.stormy || {};

stormy.location = {};
stormy.location.listeners = {};

stormy.location.addListener = function(id) {
  var listener = stormy.location.listeners[id] || {};
  listener.autocomplete = listener.autocomplete || new google.maps.places.Autocomplete($("#" + id)[0]);
  stormy.location.listeners[id] = listener;

  listener.autocomplete.addListener('place_changed', function() {
    var place = listener.autocomplete.getPlace();

    if(place.geometry && place.geometry.location) {
      var lat = place.geometry.location.lat(), long = place.geometry.location.lng();
      $.get(`/api/weather?lat=${lat}&long=${long}`, function(data) {
        $("#outputs").text(JSON.stringify(data));
      });
    }
  });
}

// place.geometry.location

window.stormy = stormy;

$(document).ready(function() {
  window.stormy.location.addListener('location');
});
