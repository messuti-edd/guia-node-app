$(document).ready(function() {
	// ---------------- HIDER
	$(".hidder").each(function() {
		var origVal = $(this).attr("default_value");
		$(this).val( origVal );
		$(this).addClass("empty_hidder");
	});

	$(".hidder").focus(function() {
		$(this).removeClass("empty_hidder");
		
		var origVal = $(this).attr("default_value");
		if ($(this).val() == origVal)
			$(this).val('');
		return;
	});

	$(".hidder").blur(function() {
		if ($(this).val() == '') {
			var origVal = $(this).attr("default_value");
			$(this).val(origVal);
			
			$(this).addClass("empty_hidder");
		}
	});
	// ---------------------------
});