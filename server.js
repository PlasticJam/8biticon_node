//setup Dependencies
var im = require('imagemagick'),
	pidfile = require('pid'),
	connect = require('connect'),
	express = require('express'),
	io = require('socket.io'),
	port = (process.env.PORT || 8421);

//Locate pidfile
pidfile('/var/run/node-pid.pid');

//Setup Express
var server = express.createServer();
server.configure(function () {
	server.set('views', __dirname + '/views');
	server.set('view options', { layout: false });
	server.use(connect.bodyParser());
	server.use(express.cookieParser());
	server.use(express.session({ secret: "shhhhhhhhh!"}));
	server.use(connect.static(__dirname + '/static'));
	server.use(server.router);
});

//setup the errors
server.error(function (err, req, res, next) {
	if (err instanceof NotFound) {
		res.render('404.jade', { locals: {
			title: '404 - Not Found', description: '', author: '', analyticssiteid: 'XXXXXXX'
		}, status: 404 });
	} else {
		res.render('500.jade', { locals: {
			title: 'The Server Encountered an Error', description: '', author: '', analyticssiteid: 'XXXXXXX', error: err
		}, status: 500 });
	}
});
server.listen(port);

//Setup Socket.IO
var io = io.listen(server);
io.sockets.on('connection', function (socket) {
	console.log('Client Connected');
	socket.on('message', function (data) {
		socket.broadcast.emit('server_message', data);
		socket.emit('server_message', data);
	});
	socket.on('disconnect', function () {
		console.log('Client Disconnected.');
	});
});


///////////////////////////////////////////
//              Routes                   //
///////////////////////////////////////////

/////// ADD ALL YOUR ROUTES HERE  /////////

server.get('/', function (req, res) {
	res.render('index.jade', {
		locals: {
			title: 'Super Mega Test', description: 'Super Mega Description', author: 'Super Mega Me', analyticssiteid: 'XXXXXXX'
		}
	});
});

server.get('/image', function (req, res) {
	var im = require('imagemagick');

	var cwd = process.cwd();

	im.composite(['-compose', 'atop', cwd + '/2.jpg', cwd + '/1.jpg', cwd + '/out.jpg'], function (err, stdout, stderr) {
		if (err) {
			throw err;
		}

		res.header({
			'Content-Type': 'image/jpeg'
		});

		res.sendfile(cwd + '/out.jpg');
	});
});

//A Route for Creating a 500 Error (Useful to keep around)
server.get('/500', function (req, res) {
	throw new Error('This is a 500 Error');
});

//The 404 Route (ALWAYS Keep this as the last route)
server.get('/*', function (req, res) {
	throw new NotFound;
});

function NotFound (msg) {
	this.name = 'NotFound';
	Error.call(this, msg);
	Error.captureStackTrace(this, arguments.callee);
}


console.log('Listening on http://0.0.0.0:' + port);
