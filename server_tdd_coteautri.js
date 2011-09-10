var tools		= require('./tools');
var http		= require('http');
var querystring = require('querystring');

var server = {
	id: 2,
	name: "TDD Coteautri",
	event_target: null,
	host: 'coteautri.bo',
	port: 80,
	path: '/coteautri/consultas.php',
	main: true,
	datas: [],
	cookie: null,
	
	restart: function() {
		this.event_target = null;
		this.path = '/coteautri/consultas.php';
		this.main = true;
		this.datas = [];
		this.cookie = null;
	},
	
	
	getData: function(opts, callback) {
		var self = this;
		var data = {
			'nom'			: opts.nombre,
			'PPaterno'		: opts.apellido,
			'link'			: 'guia',
			'slink'			: 'guia',
			'dir'			: ''
		};
		
		
		var post_data = querystring.stringify(data);
		
		var options = {
			host: self.host,
			port: self.port,
			path: self.path,
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				'Content-Length': post_data.length
			}
		};
		
		// Si se obtubo cookies de una peticion anterior se envian
		if (self.cookie != null) {
			options.headers['Cookie'] = self.cookie;
		}

		var req = http.request(options, function(res) {
			
			// Se revisa si se recivio cookies
			if (res.headers["set-cookie"] != undefined) {
				self.cookie = res.headers["set-cookie"];
			}
			var got_data = "";

			//res.setEncoding('utf8');
			res.setEncoding("binary");
			res.on('data', function (chunk) {
				got_data += chunk;
			});

			res.on("end", function() {
				console.log(got_data+"\n\n\n\n\n\n\n\n");
				self.extract(got_data, function(data) {
					callback(data);
				});
			});
		});

		req.on('error', function(e) {
			console.log('problem with request: ' + e.message);
		});
		
		// write data to request body
		req.write(post_data);
		req.end();
	},
	
	extract: function(data, callback) {
		var self = this;
		data = data.replace(/\n/g, "");
		data = data.replace(/\r/g, "");

		var table_pers = tools.getStringsBetween(data, 'Nombre Abonado', '</table>', true);

		var rows = tools.getStringsBetween(table_pers[0], "<tr", "</tr>");

		for (var i in rows) {
			var cells = tools.getStringsBetween(rows[i], '<span class=\'o_txt\' >', "<");
			if (cells[0] != undefined && cells[0].length > 0) {
				this.datas.push([ 
					tools.capitaliseFirstLetter(cells[0]), // nombre
					tools.capitaliseFirstLetter(cells[1]), // direccion
					cells[3] ]); // fono
			}
		}
		
		// si es la pagina default...
//		if (this.main) {
//			this.main = false;
//			var pages = tools.getStringsBetween(table_pers[0], "<a href=\"javascript:__doPostBack\\('", "'");
//			this.pages_count = pages.length;
//			this.pages_index = 0;
//			
//			// se hacen peticiones recurcivas a las demas paginas
//			this.getPages(function() {
//				callback(self.datas);
//			});
//			
//		}
//		else {
			// Si no solo se devuelven los datos
			callback(this.datas);
//		}
	},
	
	/**
	 * Funcion recursiva para obtener todas las paginas
	 * Utiliza un contador y un index en el objeto server
	 */
	getPages: function(callback) {
		var self = this;
		if (this.pages_index < this.pages_count) {
			self.event_target = this.pages_index+1;
			this.getData({}, function(data) {
				self.getPages(callback);
			});
			this.pages_index++;
		}
		else callback();
		
	}
}

for (var k in server) {
	exports[k] = server[k];
}

