$(document).ready(function() {
	$("input[name=buscar]").click(function() {
		$("#search_bar .loading").show();
		var nombre		= $("input[name=nombre]").val();
		var apellido	= $("input[name=apellido]").val();
		var calle		= $("input[name=calle]").val();
		
		$.getJSON("/search/"+nombre+"/"+apellido, function(data) {
			var $tbody = $("#persons tbody");
			for (var i in data) {
				$tbody.append(
					"<tr>"+
					"<td>"+data[i][0]+"</td>" +
					"<td>"+data[i][2]+"</td>" +
					"<td>"+data[i][1]+"</td>" +
					"</tr>");
			}
			
			$("#search_bar .loading").hide();
		});
	});
});