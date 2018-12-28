'use strict';

var map;
var marker;
var markerObjects = {};
var markers = [];
var currentMarker = null;
var currentInfoWindow = null;
var load = false;
var styles = [
  {
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#212121"
      }
    ]
  },
  {
    "elementType": "labels.icon",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#757575"
      }
    ]
  },
  {
    "elementType": "labels.text.stroke",
    "stylers": [
      {
        "color": "#212121"
      }
    ]
  },
  {
    "featureType": "administrative",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#757575"
      }
    ]
  },
  {
    "featureType": "administrative.country",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#9e9e9e"
      }
    ]
  },
  {
    "featureType": "administrative.land_parcel",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "administrative.locality",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#bdbdbd"
      }
    ]
  },
  {
    "featureType": "poi",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#757575"
      }
    ]
  },
  {
    "featureType": "poi.park",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#181818"
      }
    ]
  },
  {
    "featureType": "poi.park",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#616161"
      }
    ]
  },
  {
    "featureType": "poi.park",
    "elementType": "labels.text.stroke",
    "stylers": [
      {
        "color": "#1b1b1b"
      }
    ]
  },
  {
    "featureType": "road",
    "elementType": "geometry.fill",
    "stylers": [
      {
        "color": "#2c2c2c"
      }
    ]
  },
  {
    "featureType": "road",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#8a8a8a"
      }
    ]
  },
  {
    "featureType": "road.arterial",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#373737"
      }
    ]
  },
  {
    "featureType": "road.highway",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#3c3c3c"
      }
    ]
  },
  {
    "featureType": "road.highway.controlled_access",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#4e4e4e"
      }
    ]
  },
  {
    "featureType": "road.local",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#616161"
      }
    ]
  },
  {
    "featureType": "transit",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#757575"
      }
    ]
  },
  {
    "featureType": "water",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#000000"
      }
    ]
  },
  {
    "featureType": "water",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#3d3d3d"
      }
    ]
  }
];

function initMap() {
	map = new google.maps.Map(document.getElementById('map'), {
        center: fixedPoint,
        zoom: 5,
        styles: styles,
        mapTypeControl: false,
    });

    // Centers the map on to the fixed point with each resize
	google.maps.event.addDomListener(window, 'resize', function() {
		map.setCenter(fixedPoint);
	});

    // Remove leftover elements from map when filter is run
    document.getElementById("filter").addEventListener("click", function(){
        if(currentInfoWindow) {
            currentMarker.setAnimation(null);
            currentInfoWindow.close();
        }
    });

    // Two icons defined for markers based on type of game
    var singleIcon = {
        url: "img/single.png",
        scaledSize: new google.maps.Size(50, 50),
        labelOrigin:  new google.maps.Point(25,58),
    };

    var multiIcon = {
        url: "img/multiple.png",
        scaledSize: new google.maps.Size(50, 50),
        labelOrigin:  new google.maps.Point(25,58),
    };

    // Infowindow object created
    var infowindow = new google.maps.InfoWindow();

    // Bounds setup for the map
    var bounds = new google.maps.LatLngBounds();

    // The following group uses the location data to create an array of markers on initialize
    for (var i = 0; i < locations.length; i++) {
        // Create a marker per location, and set icon depending on type of game
        if (locations[i].type == "Single player") {
        	marker = new google.maps.Marker({
            // Get the position from the location array
            position: locations[i].position,
            title: locations[i].loc,
            label: {text: locations[i].loc, color: "white"},
            map: map,
            icon: singleIcon,
            animation: google.maps.Animation.DROP,
            class: i
        });
        }
        else {
        	marker = new google.maps.Marker({
            // Get the position from the location array
            position: locations[i].position,
            title: locations[i].loc,
            label: {text: locations[i].loc, color: "white"},
            map: map,
            icon: multiIcon,
            animation: google.maps.Animation.DROP,
            class: i
        });
        }

        // Add field to marker for storing twitch and steam game ids
        marker.twitch = locations[i].twitch;
        marker.steam = locations[i].steam;

        // Extend bounds and fit to map based on marker position
        bounds.extend(marker.position);
        map.fitBounds(bounds);

        // Push the marker to markerObjects for later access
        markerObjects[marker.title] = marker;

        // Push marker to markers array for tracking
        markers.push(marker);

        // Create an onclick event to toggle marker animation and 
        // open an infowindow at each marker
        marker.addListener('click', function() {
            for (var i = 0; i < markers.length; i++) {
                markers[i].setAnimation(null);
            }
            toggleAnimation(this);
            currentMarker = this;
            markerContent(this, infowindow);
        });

        // Add marker to the View Model's locArray for processing
        vm.locArray()[i].marker = marker;
    }

    // Set load to true after markers applied
    load = true;

    function toggleAnimation(marker) {
        if (marker.getAnimation() !== null) {
          marker.setAnimation(null);
        } else {
          marker.setAnimation(google.maps.Animation.BOUNCE);
        }
    }

	function markerContent(marker, infowindow) {
		infowindow.marker = marker;
        var appData = "<h1 class='header'>Most played in " + marker.title + "</h1></div>";
        var url = "https://api.twitch.tv/helix/games?id="+marker.twitch;
        $.ajax({
          type: 'GET',
          url: url,
          headers: {
            'CLIENT-ID': 'b14rerlj28xvusg8jcgydhv885ku0v'
          }
        }).done(function (response) {
                console.dir(response);
                var title = response.data[0].name;
                var imageUrl = response.data[0].box_art_url;
                var steamUrl = "https://store.steampowered.com/app/"+marker.steam;

                // imageUrl fetched has blank fields {width} and {height}
                // Replacing them with the required values.
                imageUrl = imageUrl.replace("{width}", "200");
                imageUrl = imageUrl.replace("{height}", "300");

                // Preparing url for Twitch game page.
                var twitchUrl = "https://www.twitch.tv/directory/game/"+title;

                appData = appData.concat("<p class='content'>Title: "+title+"</p>");
                appData = appData.concat("<div style='float:center'><img class='img' src=\""+imageUrl+"\"></div><br>");
                appData = appData.concat("<pre class='content'>Game pages:   <a href=\""+steamUrl+"\" target=\"_blank\">Steam</a>    <a href=\""+twitchUrl+"\" target=\"_blank\">Twitch</a></pre>");
                infowindow.setContent(appData);
             currentInfoWindow = infowindow;
             infowindow.open(map, marker);
        }).fail(function (jqXHR, textStatus) {
                console.log(jqXHR);
                console.log(textStatus);
                var error = "<p>Sorry, Cannot connect to Twitch API! Please try later</p>";
                appData = appData.concat(error);
                infowindow.setContent(appData);
                currentInfoWindow = infowindow;
                infowindow.open(map, marker);
        });

        // Clear all items when infowindow is closed.
        infowindow.addListener('closeclick',function(){
            currentInfoWindow = null;
            marker.setAnimation(null);
            infowindow.close();
        });
	}
}