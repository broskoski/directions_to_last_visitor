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

	bounds = new google.maps.LatLngBounds(origin, destination);


	var myOptions = {
		zoom:8,
		mapTypeId: google.maps.MapTypeId.ROADMAP,
		center: bounds.getCenter()
	};

	$('#content').show();
    $('#map').css('height', '400px').css('margin-bottom', '40px');
	var map = new google.maps.Map(document.getElementById("map"), myOptions);
	
	map.fitBounds(bounds);
			
	var flightPlanCoordinates = [
		new google.maps.LatLng(lat, lng),
    	new google.maps.LatLng(plat, plng)
    ];
  	
  	var flightPath = new google.maps.Polyline({
    	path: flightPlanCoordinates,
    	strokeColor: "#770077",
    	strokeOpacity: 0.4,
    	strokeWeight: 5
    });

    flightPath.setMap(map);
    
    var a_icon = 'http://maps.gstatic.com/mapfiles/marker_greenA.png';
    var b_icon = 'http://maps.gstatic.com/mapfiles/marker_greenB.png';

    var originmarker = new google.maps.Marker({
      position: origin, 
      map: map,
      icon: a_icon,
      title:"You"
  	}); 
  	
  	var destinationmarker = new google.maps.Marker({
      position: destination, 
      map: map, 
      icon: b_icon,
      title:"Previous Visitor"
  	});  

	google.maps.event.trigger(map, "resize");

	$("<div id='directions2'></div>").insertAfter('#directions');

	var directionsServiceOrigin = new google.maps.DirectionsService();
	var directionsDisplayOrigin = new google.maps.DirectionsRenderer();
	var directionsServiceDestination = new google.maps.DirectionsService();
	var directionsDisplayDestination = new google.maps.DirectionsRenderer();

	directionsDisplayOrigin.setPanel(document.getElementById("directions"));
	directionsDisplayDestination.setPanel(document.getElementById("directions2"));

	var geocoder = new google.maps.Geocoder();
	geocoder.geocode({'latLng': origin}, function(resultsGeoOrigin, statusGeoOrigin) {
		if (statusGeoOrigin == google.maps.GeocoderStatus.OK) {
			if (resultsGeoOrigin[5]) {

				originairport = resultsGeoOrigin[5].formatted_address;

				var requestOrigin = {
					origin: destination, 
					destination: 'Airport near ' + destination,
					travelMode: google.maps.DirectionsTravelMode.DRIVING
				};

				directionsServiceOrigin.route(requestOrigin, function(responseOrigin, statusOrigin) {
					
					if (statusOrigin == google.maps.DirectionsStatus.OK) {
						geocoder.geocode({'latLng': destination}, function(resultsGeoDestination, statusGeoDestination) {
							
							if (statusGeoDestination == google.maps.GeocoderStatus.OK) {
								if (resultsGeoDestination[5]) {

									destinationairport = resultsGeoDestination[5].formatted_address;

									var requestDestination = {
										origin: 'Airport near ' + destinationairport, 
										destination: destination,
										travelMode: google.maps.DirectionsTravelMode.DRIVING
									};

									directionsServiceDestination.route(requestDestination, function(responseDestination, statusDestination) {
										if (statusDestinaion == google.maps.DirectionsStatus.OK) {
											directionsDisplayDestination.setDirections(responseDestination);
										}
									});
								}
							}
						});
						directionsDisplayOrigin.setDirections(responseOrigin);
					}
				});
				}
		} else {
			show_direction_error()
		}
	});
}
/** Converts numeric degrees to radians */
function toRad(int){
    return ((int * Math.PI) / 180);
}
function show_direction_error(){
	$('#content').show();
	$('#content').html('<h1>Directions could not be found between you and '+pip+'. Try again later.</h1>');
}