$(document).ready(function() {
	
	var selDep = null;
	
	$("select[name=dep]").change(function() {
		if ($(this).val() == 1) {
			$("input[name=apellido]").show();
			selDep = "scz";
		}
		else if ($(this).val() == 2) {
			$("input[name=apellido]").hide();
			selDep = "tdd";
		}
	});
	
	$("input[name=apellido], input[name=calle]").keydown(function(evt) {
		if (evt.keyCode == 13) {
			$("input[name=buscar]").click();
		}
	});
	
	$("input[name=buscar]").click(function() {
		
		var depart		= $("select[name=dep]").val();
		var nombre		= $("input[name=nombre]").val();
		var apellido	= $("input[name=apellido]").val();
		var calle		= $("input[name=calle]").val();
		var $tbody		= $("#persons tbody");
		
		if ($("select[name=dep]").val() == "") {
			alert("Selecciona un depertamento!");
			return;
		}
		else if (nombre == $("input[name=nombre]").attr("default_value") || nombre.length < 2) {
			alert("Ingresa un nombre a buscar!");
			return;
		}
		else if (selDep == "scz" && 
			apellido == $("input[name=apellido]").attr("default_value") || apellido.length < 2) {
			alert("Ingresa un apellido(s) a buscar!");
			return;
		}
		
		$("#search_bar .loading").show();
		$tbody.hide(500, function(){
			$tbody.html("");

			$.getJSON("/search/"+depart+"/"+nombre+"/"+apellido+"/"+calle, function(data) {
				
				if (data.error != undefined) {
					$("#search_bar .loading").hide();
					alert(data.errorMssg);
					return;
				}

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