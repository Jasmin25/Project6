'use strict';

// Marker object consisting of location name and marker
var Marker = function(data) {
	this.loc = ko.observable(data.loc);
	this.marker = ko.observable(data.marker);
};

var ViewModel = function() {
	var self = this;
	// locArray() is an array of Marker type objects
	this.locArray = ko.observableArray([]);
	locations.forEach(function(oneMarker) {
		self.locArray.push(new Marker(oneMarker));
	});

	// Trigger the onclick event for marker in app.js
    this.clickMarker = function(selected) {
        if (selected) {
            google.maps.event.trigger(markerObjects[selected.loc()], "click");
        }
    };

	// Computed observable from Knockout which filters locations and markers based on input
	this.filter = ko.observable("");
	// Filter Function for filtering based on Knockout's computed observable
    this.searchQuery = ko.computed(function() {
		var filter = self.filter().toLowerCase();
		if (load) {
			if (!filter) {
				for (var i = 0; i < self.locArray().length; i++) {
					self.locArray()[i].marker.setVisible(true);
				}
				return self.locArray();
			} else {
				return ko.utils.arrayFilter(self.locArray(), function(item) {
					var result = item.loc().toLowerCase().includes(filter);
					if (result) {
						if (item.marker) {
							item.marker.setVisible(true);
						}
					} else {
						if (item.marker) {
							item.marker.setVisible(false);
						}
					}
					return result;
				});
			}
		} else {
			return self.locArray();
		}
	});
};

// Create ViewModel and apply bindings
var vm = new ViewModel();
ko.applyBindings(vm);