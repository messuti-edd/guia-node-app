var express		= require('express');
var http		= require('http');
var querystring = require('querystring'); 

var app = express.createServer(express.logger());

app.get('/', function(request, response) {
	
	var post_data = querystring.stringify({
	  'PPoblacion'	: '1',
	  'PNombre'		: 'juan',
	  'PPaterno'	: 'suarez',
	  'POtro'		: '',
	  'cmdPBuscar.x': '55',
	  'cmdPBuscar.y': '50',
	  'EPoblacion'	: '1',
	  'ENombre'		: '',
	  '__VIEWSTATE'	: '/wEPDwULLTEyNTk4MDE1MTdkGAEFHl9fQ29udHJvbHNSZXF1aXJlUG9zdEJhY2tLZXlfXxYCBQpjbWRQQnVzY2FyBQpjbWRFQnVzY2FyE0MDoaTgcV+/y9SlLq0pr7csGvc=',
	  '__EVENTVALIDATION' : '/wEWCwK2h8+7CALe5pGLCwLf5pGLCwKWtPDnAQLCz9KyBgLhg8eMBgK2t4G2CQKRlOOLCwKQlOOLCwLhr/DnAQK2t4U9MAzgYj6ro8NfmR5TLqXZDiSQOb8='
	});  

	var options = {
		host: '200.58.175.36',
		port: 80,
		path: '/GuiaTelefonica2006/forms/default.aspx',
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
			'Content-Length': post_data.length
		}
	};

	var req = http.request(options, function(res) {
		//console.log('STATUS: ' + res.statusCode);
		//console.log('HEADERS: ' + JSON.stringify(res.headers));
		 var got_data = "";

		res.setEncoding('utf8');
		res.on('data', function (chunk) {
			got_data += chunk;
		});
		
		res.on("end", function() {
			
			got_data = got_data.replace(/\n/g, "");
			got_data = got_data.replace(/\r/g, "");
			
			var view_state = getStringsBetween(got_data, 'name="__VIEWSTATE" id="__VIEWSTATE" value="', '"');
			var event_validation = getStringsBetween(got_data, 'name="__EVENTVALIDATION" id="__EVENTVALIDATION" value="', '"');
			var table_pers = getStringsBetween(got_data, '<table cellspacing="0" rules="all" border="1" id="grdPersona"', '</table>', true);
			
			var rows = getStringsBetween(table_pers[0], "<tr", "</tr>");
			
			var resp = "";
			for (var i in rows) {
				var cells = getStringsBetween(rows[i], '<td><font face="Verdana" color="Black" size="1">', "<");
				if (cells[0] != undefined)
					resp += cells[0]+"<br>";
			}
			
			console.log(got_data);
			response.send(resp);
		});
	});

	req.on('error', function(e) {
		console.log('problem with request: ' + e.message);
	});

	// write data to request body
	req.write(post_data);
	req.end();
});

var port = process.env.PORT || 3000;
app.listen(port, function() {
	console.log("Listening on " + port);
});


function getStringsBetween(subject, str1, str2, inclusive) {
	if (inclusive == null) inclusive = false;
	
	var found = [],
	rxp = new RegExp(str1+'(.*?)'+str2, 'g'),
	curMatch;

	while( curMatch = rxp.exec( subject ) ) {
		found.push( curMatch[inclusive ? 0 : 1] );
	}

	return found;
}