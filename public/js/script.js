$(document).ready(function() {
	get_location();
});

function get_directions(){
	plng = $('#prev_lng').html();
	plat = $('#prev_lat').html();
	
	var directionsService = new google.maps.DirectionsService();
	var directionsDisplay = new google.maps.DirectionsRenderer();
	
	var myOptions = {
		zoom:7,
		mapTypeId: google.maps.MapTypeId.ROADMAP
	}

	// var map = new google.maps.Map(document.getElementById("map"), myOptions);
	
	// directionsDisplay.setMap(map);
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
		alert(status);
		directionsDisplay.setDirections(response);
		// if (status == google.maps.DirectionsStatus.OK) {
		// 		
		// 	}else{
		// 		$('#directions').html("No directions found between these two locations");
		// 	}
	});
}

function get_location() {
	if (geo_position_js.init()) {
	  geo_position_js.getCurrentPosition(geo_success, geo_error);
	}
}

function geo_success(position){
	lat = position.coords.latitude;
	lng = position.coords.longitude;
	
	$("#lnglat").html(lat + ", " + lng);
	
	$.post("update/"+current_id, {lat: lat, lng: lng} );
	
	get_directions();
}

function geo_error(err) {
	get_directions();
}