function doIt() {
var result = $("[name='choice']:checked").val();
		$.put( '/triage', result, function(data) {
			$('#results').html(data);
		});
};
    