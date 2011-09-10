var tools		= require('./tools');
var http		= require('http');
var querystring = require('querystring');

var server = {
	id: 1,
	name: "SCZ Cotas",
	view_state: '/wEPDwULLTEyNTk4MDE1MTdkGAEFHl9fQ29udHJvbHNSZXF1aXJlUG9zdEJhY2tLZXlfXxYCBQpjbWRQQnVzY2FyBQpjbWRFQnVzY2FyE0MDoaTgcV+/y9SlLq0pr7csGvc=',
	event_validation: '/wEWCwK2h8+7CALe5pGLCwLf5pGLCwKWtPDnAQLCz9KyBgLhg8eMBgK2t4G2CQKRlOOLCwKQlOOLCwLhr/DnAQK2t4U9MAzgYj6ro8NfmR5TLqXZDiSQOb8=',
	event_target: null,
	host: '200.58.175.36',
	port: 80,
	path: '/GuiaTelefonica2006/forms/default.aspx',
	main: true,
	pageFormat: "grdPersona$ctl14$ctl0",
	datas: [],
	cookie: null,
	toAbort: null,
	abort: false,
	requests: [],
	
	restart: function() {
		this.view_state = '/wEPDwULLTEyNTk4MDE1MTdkGAEFHl9fQ29udHJvbHNSZXF1aXJlUG9zdEJhY2tLZXlfXxYCBQpjbWRQQnVzY2FyBQpjbWRFQnVzY2FyE0MDoaTgcV+/y9SlLq0pr7csGvc=';
		this.event_validation = '/wEWCwK2h8+7CALe5pGLCwLf5pGLCwKWtPDnAQLCz9KyBgLhg8eMBgK2t4G2CQKRlOOLCwKQlOOLCwLhr/DnAQK2t4U9MAzgYj6ro8NfmR5TLqXZDiSQOb8=';
		this.event_target = null;
		this.path = '/GuiaTelefonica2006/forms/default.aspx';
		this.main = true;
		this.pageFormat = "grdPersona$ctl14$ctl0";
		this.datas = [];
		this.cookie = null;
	},
	
	
	getData: function(opts, callback) {
		var self = this;
		var data = {
		  '__VIEWSTATE' : self.view_state,
		  '__EVENTVALIDATION' : self.event_validation
		};
		
		// Es otra pagina que la default
		if (self.event_target != null) {
			tools.extend(data, {
				"__EVENTTARGET": self.pageFormat + self.event_target,
				"__EVENTARGUMENT" : ""
			});
			
			self.path = '/GuiaTelefonica2006/forms/Listado.aspx';
			self.event_target = null;
		}
		// Es la default, se definen los campos de busqueda
		else {
			tools.extend(data, {
				'PPoblacion'	: '1',
				'PNombre'		: opts.nombre,
				'PPaterno'		: opts.apellido,
				'POtro'			: '',
				'cmdPBuscar.x'	: '55',
				'cmdPBuscar.y'	: '50',
				'EPoblacion'	: '1',
				'ENombre'		: ''
			});
			
			self.path = '/GuiaTelefonica2006/forms/default.aspx';
		}
		
		//console.log(JSON.stringify(data));
		
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

			res.setEncoding('utf8');
			res.on('data', function (chunk) {
				got_data += chunk;
			});

			res.on("end", function() {
				//console.log(got_data+"\n\n\n\n\n\n\n\n");
				self.extract(got_data, function(data) {
					callback(data);
				});
			});
		});
		
		self.requests.push(req);
		
		if (self.main) {
			self.toAbort = setTimeout(function() {
				self.abort = true;
				console.log("ABORTING");
				for (var i in self.requests) {self.requests[i].abort();}
				callback({error: true, errorMssg: "Hubo un error, inténtalo de nuevo :("});
			}, 20000);
		}

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

		this.view_state = tools.getStringsBetween(data, 'name="__VIEWSTATE" id="__VIEWSTATE" value="', '"')[0];
		this.event_validation = tools.getStringsBetween(data, 'name="__EVENTVALIDATION" id="__EVENTVALIDATION" value="', '"')[0];
		var table_pers = tools.getStringsBetween(data, '<table cellspacing="0" rules="all" border="1" id="grdPersona"', '</table>', true);

		var rows = tools.getStringsBetween(table_pers[0], "<tr", "</tr>");

		for (var i in rows) {
			var cells = tools.getStringsBetween(rows[i], '<td><font face="Verdana" color="Black" size="1">', "<");
			if (cells[0] != undefined && cells[0].length > 0) {
				this.datas.push([ 
					tools.capitaliseFirstLetter(cells[0]), // nombre
					tools.capitaliseFirstLetter(cells[1]), // direccion
					cells[3] ]); // fono
			}
		}
		
		// si es la pagina default...
		if (this.main) {
			this.main = false;
			var pages = tools.getStringsBetween(table_pers[0], "<a href=\"javascript:__doPostBack\\('", "'");
			this.pages_count = pages.length;
			this.pages_index = 0;
			
			// se hacen peticiones recurcivas a las demas paginas
			this.getPages(function() {
				clearTimeout(self.toAbort);
				console.log("** not aborting");
				callback(self.datas);
			});
			
		}
		else {
			// Si no solo se devuelven los datos
			callback(this.datas);
		}
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

