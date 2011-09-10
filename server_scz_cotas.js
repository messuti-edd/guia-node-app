var tools		= require('./tools');
var http		= require('http');
var querystring = require('querystring');

var server = {
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
	
	
	getData: function(opts, callback) {
		var self = this;
		var data = {
		  '__VIEWSTATE' : self.view_state,
		  '__EVENTVALIDATION' : self.event_validation
		};
		
		if (self.event_target != null) {
			tools.extend(data, {
				"__EVENTTARGET": self.pageFormat + self.event_target,
				"__EVENTARGUMENT" : ""
			});
			
			self.path = '/GuiaTelefonica2006/forms/Listado.aspx';
			self.event_target = null;
		}
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
		
		console.log("data sent: " + JSON.stringify(data));
		
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
		
		if (self.cookie != null) {
			options.headers['Cookie'] = self.cookie;
		}

		var req = http.request(options, function(res) {
//			console.log('HEADERS: ' + JSON.stringify(res.headers));
			if (res.headers["set-cookie"] != undefined) {
				self.cookie = res.headers["set-cookie"];
				console.log("cookies: "+res.headers["set-cookie"]);
			}
			var got_data = "";

			res.setEncoding('utf8');
			res.on('data', function (chunk) {
				got_data += chunk;
			});

			res.on("end", function() {
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

		this.view_state = tools.getStringsBetween(data, 'name="__VIEWSTATE" id="__VIEWSTATE" value="', '"')[0];
		this.event_validation = tools.getStringsBetween(data, 'name="__EVENTVALIDATION" id="__EVENTVALIDATION" value="', '"')[0];
		var table_pers = tools.getStringsBetween(data, '<table cellspacing="0" rules="all" border="1" id="grdPersona"', '</table>', true);

		var rows = tools.getStringsBetween(table_pers[0], "<tr", "</tr>");

		for (var i in rows) {
			var cells = tools.getStringsBetween(rows[i], '<td><font face="Verdana" color="Black" size="1">', "<");
			if (cells[0] != undefined && cells[0].length > 0) {
				this.datas.push([ cells[0], cells[1], cells[3] ]);
				console.log("nombre: "+cells[0]+", num: "+cells[3]);
			}
		}
		
		
		
		if (this.main) {
			console.log("first data\n");
			this.main = false;
			var pages = tools.getStringsBetween(table_pers[0], "<a href=\"javascript:__doPostBack\\('", "'");
			this.pages_count = pages.length;
			this.pages_index = 0;
			
			this.getPages(function() {
				callback(self.datas);
			});
			
		}
		else {
			callback(this.datas);
		}
	},
	
	getPages: function(callback) {
		var self = this;
		if (this.pages_index < this.pages_count) {
			self.event_target = this.pages_index+1;
			console.log(this.pages_index+" data\n");
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

