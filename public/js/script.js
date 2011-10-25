var originmarker, destinationmarker, map, origin, destination;

function get_location() {
	if (geo_position_js.init()) {
	  geo_position_js.getCurrentPosition(geo_success, geo_error, {enableHighAccuracy: true, maximumAge: 85000});
	}
}

function geo_success(position){
	geolat = position.coords.latitude;
	geolng = position.coords.longitude;
	
	$("#lnglat").html(geolat + "°, " + geolng + "°");
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
	
	origin = new google.maps.LatLng(lat, lng);
	
	if(plng !== "Cancun,Mexico"){
		destination = new google.maps.LatLng(plat, plng);
	}else{
		destination = plng;
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

function try_international_directions(origin, destination){
	var bounds = new google.maps.LatLngBounds();

	bounds.extend(origin);
	bounds.extend(destination);

	var myOptions = {
		zoom:1,
		mapTypeId: google.maps.MapTypeId.ROADMAP,
		center: bounds.getCenter()
	};

	$('#content').show();
    $('#map').css('height', '400px').css('margin-bottom', '40px');
	map = new google.maps.Map(document.getElementById("map"), myOptions);
	google.maps.event.trigger(map, "resize");
	
	map.fitBounds(bounds);
			
	var flightPlanCoordinates = [
		new google.maps.LatLng(lat, lng),
    	new google.maps.LatLng(plat, plng)
    ];
  	
  	var flightPath = new google.maps.Polyline({
    	path: flightPlanCoordinates,
    	strokeColor: "#3300ff",
    	strokeOpacity: 0.4,
    	strokeWeight: 5
    });

    flightPath.setMap(map);
    
    var a_icon = 'http://maps.gstatic.com/mapfiles/marker_greenA.png';
    var b_icon = 'http://maps.gstatic.com/mapfiles/marker_greenB.png';

    originmarker = new google.maps.Marker({
      position: origin, 
      map: map,
      icon: a_icon,
      title:"You"
  	}); 
  	  	
  	destinationmarker = new google.maps.Marker({
      position: destination, 
      map: map, 
      icon: b_icon,
      title:"Previous Visitor"
  	});

	var geocoder = new google.maps.Geocoder();
	geocoder.geocode({'latLng': destination}, function(resultsGeoOrigin, statusGeoOrigin) {
		if (statusGeoOrigin == google.maps.GeocoderStatus.OK) {
			if (resultsGeoOrigin[0]) {
				origin_address = resultsGeoOrigin[0].formatted_address;
				origin_city = resultsGeoOrigin[4].formatted_address;
				$("#you").addClass('click').before("<h2> No directions between </h2>");
				$('<img src="http://maps.gstatic.com/mapfiles/marker_greenA.png">').prependTo('#you');
				$("#lnglat").after("<h2> and </h2>");
				$('#last').addClass('click');
				$('<img src="http://maps.gstatic.com/mapfiles/marker_greenB.png">').prependTo('#last');
				$("#prev_lnglat").html("<h4> "+origin_address+" </h4>");
				$("#prev_lnglat").after('<h4 style="text-align:center">(<a href="http://www.anrdoezrs.net/click-5512762-10594992" style="text-decoration:underline">Find flights to '+origin_city+'</a>)</h4>')
			}
		}
	});
    
}
$('.click').live('click', function(event){
	which = $(this).attr('id') == 'you' ? origin : destination;
	map.setCenter(which);
	map.setZoom(15);
});
function show_direction_error(){
	$('#content').show();
	$('#content').html('<h1>Directions could not be found between you and '+pip+'. Try again later.</h1>');
}