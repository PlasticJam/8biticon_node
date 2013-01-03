//setup Dependencies
var im = require('imagemagick'),
	uuid = require('node-uuid'),
	pidfile = require('pid'),
	engines = require('consolidate')
	express = require('express'),
	fs = require('fs'),
	io = require('socket.io'),
	port = 8421; //port = (process.env.PORT || 8421);

//Locate pidfile
pidfile('/var/run/node-pid.pid');

//Setup Express
var server = express();

server.engine('jade', engines.jade);

server.set('views', __dirname + '/views');
server.set('view options', { layout: false });
server.use(express.bodyParser());
server.use(express.cookieParser());
server.use(express.session({ secret: "shhhhhhhhh!"}));
server.use(express.static('static'));
server.use(server.router);
server.use(function (err, req, res, next) {
	if (err instanceof NotFound) {
		res.render('404.jade',{
			title: '404 - Not Found', description: '', author: '', analyticssiteid: 'XXXXXXX'
		});
	} else {
		res.render('500.jade', {
			title: 'The Server Encountered an Error', description: '', author: '', analyticssiteid: 'XXXXXXX', error: err
		});
	}
});


if ('mindfreakthemon' == server.get('env')) {
	console.log('mindfreakthemon\'s-BLACKBOX');
	im.convert.path = 'D:\\Server\\imagemagick\\convert';
}

server.listen(port);

///////////////////////////////////////////
//              Routes                   //
///////////////////////////////////////////

/////// ADD ALL YOUR ROUTES HERE  /////////

var structure = require('./static/8bit/js/8settings.json');

server.post('/constructor/download/', function (req, res) {
	var data = req.body.data || {},
		gender = ['male', 'female'].indexOf(req.body.gender) === -1
			? 'male'
			: req.body.gender;

	try {
		data = JSON.parse(data);
	} catch (e) {}

	var image_dir = './static/8bit/img/' + gender + '/',
		output_image = './media/' + uuid.v1() + '.jpg',
		command = ['-size', '400x400', 'xc:white'];

	structure[gender].slice(0).reverse().forEach(function (layer) {
		command.push(image_dir + layer.name + (data[layer.name] || 1) + '.png', '-composite');
	});

	command.push('-fill', 'white', '-draw', 'rectangle 0,388 400,400');
	command.push('-fill', '#636363', '-pointsize', '10', '-draw', 'gravity NorthWest text 290,388 \'made by 8biticon.com\'');
	command.push(output_image);

	im.convert(command, function (err, stdout, stderr) {
		if (err) {
			throw err;
		}

		res.download(output_image, 'download.jpg', function () {
			fs.unlink(output_image);
		});
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
