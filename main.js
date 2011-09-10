var express		= require('express');
var http		= require('http');
var querystring = require('querystring');
var tools		= require('./tools');
var scz_cotas	= require('./server_scz_cotas');

//var db			= require('./db');

var app = express.createServer(express.logger());

app.use("/", express.static(__dirname + '/public/test.html'));

app.get('/search/:nombre/:apellido', function(request, response) {
	
	
	scz_cotas.getData({"nombre": request.params.nombre, "apellido": request.params.apellido}, 
		function(data) {
			console.log("responding");
			response.send(JSON.stringify(data));
			scz_cotas.restart();
		});
});

var port = process.env.PORT || 3000;
app.listen(port, function() {
	console.log("Listening on " + port);
});


