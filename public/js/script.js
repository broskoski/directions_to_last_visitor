$(document).ready(function() {
	get_location();
});

function get_directions(lat, lng){
	plng = $('#prev_lng').html();
	plat = $('#prev_lat').html();
	
	var directionsService = new google.maps.DirectionsService();
	var directionsDisplay = new google.maps.DirectionsRenderer();
	
	var myOptions = {
		zoom:7,
		mapTypeId: google.maps.MapTypeId.ROADMAP
	}
		
	// directionsDisplay.setMap(map);
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
			directionsDisplay.setDirections(response);
		}else{
			$("#map").css('height', '400px');
			var map = new google.maps.Map(document.getElementById("map"), myOptions);

			var marker_a = new google.maps.Marker({
				position: origin,
				map: map,
				title:"A"
			});
			var marker_b = new google.maps.Marker({
				position: destination,
				map: map,
				title:"b"
			});    
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
	$('#content').html('');
}