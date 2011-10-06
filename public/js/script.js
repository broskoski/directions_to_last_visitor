$(document).ready(function() {
	get_location();
});

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
			$('#content').show();
			$('#content').html('<h1>Directions could not be found between '+lat+','+lng+' and '+plat+', '+plng+'</h1>');

		}
	});
}

function get_location() {
	if (geo_position_js.init()) {
	  geo_position_js.getCurrentPosition(geo_success, geo_error);
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