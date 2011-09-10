var express		= require('express');
var http		= require('http');
var querystring = require('querystring');
var tools		= require('./tools');
var scz_cotas	= require('./server_scz_cotas');
//var db			= require('./db');

var app = express.createServer(express.logger());

app.use("/", express.static(__dirname + '/public'));

app.get('/', function(request, response) {
	
	scz_cotas.getData({"nombre": "juan", "apellido": "suarez"}, 
	function(data) {
		console.log("responding");
		response.send(JSON.stringify(data));
//		response.send("hola");
	});
});

var port = process.env.PORT || 3000;
app.listen(port, function() {
	console.log("Listening on " + port);
});


