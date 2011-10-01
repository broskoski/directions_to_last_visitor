$(document).ready(function() {
	get_location()
});

function get_location() {
  	navigator.geolocation.getCurrentPosition(handle_success, handle_error, {maximumAge: 75000});
}

function handle_success(position){
	var latitude = position.coords.latitude;
	var longitude = position.coords.longitude;
	alert('hello');
	alert('lat=' + latitude + ' long: '+ longitude);
}

function handle_error(err) {
  
}