function get_location() {
	if (geo_position_js.init()) {
	  geo_position_js.getCurrentPosition(geo_success, geo_error, {enableHighAccuracy: true, maximumAge: 85000});
	}
}

function geo_success(position){
	geolat = position.coords.latitude;
	geolng = position.coords.longitude;
	
	$("#lnglat").html(geolat + ", " + geolng);
	
	$.post("update/"+current_id, {lat: geolat, lng: geolng} );
	
	get_directions(geolat, geolng);
}

function geo_error(err) {
	$('#content').show();
	$('#content').html('<h1>Your device must provide your location<br>for this piece to function.</h1>');
}
function get_directions(lat, lng){
	plng = $('#prev_lng').html();
	plat = $('#prev_lat').html();
	
	var directionsService = new google.maps.DirectionsService();
	var directionsDisplay = new google.maps.DirectionsRenderer();
	
	var myOptions = {
		zoom:8,
		mapTypeId: google.maps.MapTypeId.ROADMAP
	}
	var map = new google.maps.Map(document.getElementById("map"), myOptions);
		
	directionsDisplay.setMap(map);
	directionsDisplay.setPanel(document.getElementById("directions"));
	
	var origin = new google.maps.LatLng(lat, lng);
	
	if(plng !== "Cancun,Mexico"){
		var destination = new google.maps.LatLng(plat, plng);
	}else{
		var destination = plng;
	}
	
	var request = {
		origin: origin, 
		destination: destination,
		travelMode: google.maps.DirectionsTravelMode.DRIVING
	};

	directionsService.route(request, function(response, status) {
		if (status == google.maps.DirectionsStatus.OK) {
			$('#content').show();
			$('#map').css('height', '400px').css('margin-bottom', '40px');
			google.maps.event.trigger(map, "resize");
			directionsDisplay.setDirections(response);
		}else{
			try_international_directions(origin, destination);
		}
	});
}

//disgusting, i know.
function try_international_directions(origin, destination){
	
	//add map and directions elements
	$("<div id='map2'></div>").insertAfter('#directions');
	$("<div id='directions2'></div>").insertAfter('#map2');

	var directionsServiceOrigin = new google.maps.DirectionsService();
	var directionsDisplayOrigin = new google.maps.DirectionsRenderer();

	var directionsServiceDestination = new google.maps.DirectionsService();
	var directionsDisplayDestination = new google.maps.DirectionsRenderer();
	
	var myOptions = {
		zoom:8,
		mapTypeId: google.maps.MapTypeId.ROADMAP
	}

	var mapOrigin = new google.maps.Map(document.getElementById("map"), myOptions);
	var mapDestination = new google.maps.Map(document.getElementById("map2"), myOptions);
		
	directionsDisplayOrigin.setMap(mapOrigin);
	directionsDisplayOrigin.setPanel(document.getElementById("directions"));

	directionsDisplayDestination.setMap(mapDestination);
	directionsDisplayDestination.setPanel(document.getElementById("directions2"));
	
	var geocoder = new google.maps.Geocoder();
	geocoder.geocode({'latLng': origin}, function(resultsGeoOrigin, statusGeoOrigin) {
		if (statusGeoOrigin == google.maps.GeocoderStatus.OK) {
			if (resultsGeoOrigin[5]) {

				originairport = resultsGeoOrigin[5].formatted_address;

				var requestOrigin = {
					origin: origin, 
					destination: 'airport near ' + lat + ", " + lng,
					travelMode: google.maps.DirectionsTravelMode.DRIVING
				};

				directionsServiceOrigin.route(requestOrigin, function(responseOrigin, statusOrigin) {
					
					if (statusOrigin == google.maps.DirectionsStatus.OK) {
						geocoder.geocode({'latLng': destination}, function(resultsGeoDestination, statusGeoDestination) {
							
							if (statusGeoDestination == google.maps.GeocoderStatus.OK) {
								if (resultsGeoDestination[5]) {

									destinationairport = resultsGeoDestination[5].formatted_address;

									var requestDestination = {
										origin: 'airport near '  + plat + ", " + plng, 
										destination: destination,
										travelMode: google.maps.DirectionsTravelMode.DRIVING
									};

									directionsServiceOrigin.route(requestDestination, function(responseDestination, statusDestination) {
										if (statusOrigin == google.maps.DirectionsStatus.OK) {
											$('#map2').css('height', '400px').css('width', '100%').css('margin-bottom', '40px');
											google.maps.event.trigger(mapDestination, "resize");
											directionsDisplayDestination.setDirections(responseDestination);
										}else{
											show_direction_error()
										}
									});
								}
							}else{
								show_direction_error();
							}
						});
						$('#content').show();
						$('#map').css('height', '400px').css('margin-bottom', '40px');
						google.maps.event.trigger(mapOrigin, "resize");
						directionsDisplayOrigin.setDirections(responseOrigin);
					}else{
						show_direction_error()
					}
				});
				}
		} else {
			show_direction_error()
		}
	});
}

function show_direction_error(){
	$('#content').show();
	$('#content').html('<h1>Directions could not be found between '+lat+','+lng+' and '+plat+', '+plng+'</h1>');
}