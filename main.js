var express		= require('express');
var http		= require('http');
var querystring = require('querystring');
var tools		= require('./tools');
//var db			= require('./db');

var gServers = [
	require('./server_scz_cotas'), 
	require('./server_tdd_coteautri')
];

var app = express.createServer(express.logger());

app.use("/", express.static(__dirname + '/public'));

app.post("/", express.static(__dirname + '/public'));

app.get('/search/:depart/:nombre/:apellido/:calle', function(request, response) {
	
	var gServer = null;
	for (var i in gServers) {
		if (gServers[i].id == request.params.depart) {
			gServer = gServers[i];
			console.log("*** server: "+gServer.name);
		}
	}
	
	
	gServer.getData({"nombre": request.params.nombre, "apellido": request.params.apellido}, 
		function(data) {
			console.log("responding");
			response.send(JSON.stringify(data));
			gServer.restart();
		});
});

var port = process.env.PORT || 3000;
app.listen(port, function() {
	console.log("Listening on " + port);
});


