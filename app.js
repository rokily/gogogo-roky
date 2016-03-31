var restify = require('restify');
var config = require('./routes/config');
var admin = require('./routes/admin');
var db = require('./routes/utils/db');

var count = 0;

var app = restify.createServer({
	name : 'go!go!go!',
	version : '0.0.1'
});

app.use(restify.acceptParser(app.acceptable));
app.use(restify.queryParser());
app.use(restify.bodyParser());

app.get(/\/public\/?.*/, restify.serveStatic({
  directory: __dirname,
  default: 'index.html'
}));

app.use(function(req, res, next){
	console.log('------------------------------------------------------------');
	console.log('Time:' + Date());
	console.log('req.ip:' + req.ip);
	console.log('req.method:' + req.method);
	console.log('req.url:' + req.url);
	// if('GET'!=req.method && 'DELETE'!=req.method && !req.is('application/json')){ 
	// 	return next(new restify.WrongAcceptError("Only provides applicaion/json")) ;
	// }
	res.setHeader('content-type','application/json');
	res.charSet('utf-8');
	return next();
});

var user = require('./routes/api/user')(app);
var action = require('./routes/api/action')(app);
var activity = require('./routes/api/activity')(app);
var comment = require('./routes/api/comment')(app);
var dictionary = require('./routes/api/dictionary')(app);
var evaluation = require('./routes/api/evaluation')(app);
var friend = require('./routes/api/friend')(app);
var image = require('./routes/api/image')(app);
var message = require('./routes/api/message')(app);
var sysinfo = require('./routes/api/sysinfo')(app);

var admin = require('./routes/admin')(app);

// start server on the specified port and binding host
var port = process.env.PORT || config.port;
db.connDB().then(function(data) {
	console.log('DB -- ' + JSON.stringify(data))
	app.listen(port, function(err) {
		if(err) {
			console.error(err);
		} else {
			console.log("%s App is listening at %s", app.name, port);
		}
	});
});

