$(document).ready(function() {
	
	
	$("input[name=apellido], input[name=calle]").keydown(function(evt) {
		if (evt.keyCode == 13) {
			$("input[name=buscar]").click();
		}
	});
	
	$("input[name=buscar]").click(function() {
		$("#search_bar .loading").show();
		$("input.submit").attr("disable", true);
		var nombre		= $("input[name=nombre]").val();
		var apellido	= $("input[name=apellido]").val();
		var calle		= $("input[name=calle]").val();
		var $tbody = $("#persons tbody");
		
		$tbody.hide(500, function(){
			$tbody.html("");

			$.getJSON("/search/"+nombre+"/"+apellido, function(data) {

				for (var i in data) {
					$tbody.append(
						"<tr>"+
						"<td>"+data[i][0]+"</td>" +
						"<td>"+data[i][2]+"</td>" +
						"<td>"+data[i][1]+"</td>" +
						"</tr>");
				}

				$tbody.show(500, function() {});
				$("#search_bar .loading").hide();
			});
		});
		
		
	});
});