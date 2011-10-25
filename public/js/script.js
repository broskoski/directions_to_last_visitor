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
    	strokeColor: "#3300ff",
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

  	var originwindow = new google.maps.InfoWindow({
    	content: "You"
	});

	google.maps.event.addListener(originmarker, 'click', function() {
  		originwindow.open(map,originmarker);
	});
  	
  	var destinationmarker = new google.maps.Marker({
      position: destination, 
      map: map, 
      icon: b_icon,
      title:"Previous Visitor"
  	});  

  	var destinationwindow = new google.maps.InfoWindow({
    	content: "Previous Visitor"
	});

	google.maps.event.addListener(destinationmarker, 'click', function() {
  		destinationwindow.open(map,destinationmarker);
	});

	google.maps.event.trigger(map, "resize");
}
/** Converts numeric degrees to radians */
function toRad(int){
    return ((int * Math.PI) / 180);
}
function show_direction_error(){
	$('#content').show();
	$('#content').html('<h1>Directions could not be found between you and '+pip+'. Try again later.</h1>');
}