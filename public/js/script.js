$(document).ready(function() {
	get_location();
});

function plot_map(){
	plng = $('#prev_lng').html();
	plat = $('#prev_lat').html();
	
	var directions = $.get('http://maps.googleapis.com/maps/api/directions/json?sensor=true&origin='+lat+","+lng+"&destination="+plat+","+plng);
	
	var latlng = new google.maps.LatLng(lat, lng);
	var myOptions = {
		zoom: 16,
		center: latlng,
		mapTypeId: google.maps.MapTypeId.ROADMAP
	};
	
	var map = new google.maps.Map(document.getElementById("map"), myOptions);
	
	var marker = new google.maps.Marker({
		position: latlng, 
		map: map, 
		title: "You"
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
	
	$("#lnglat").html(lng + ", " + lat);
	plot_map();
}

function geo_error(err) {
	plot_map();
}